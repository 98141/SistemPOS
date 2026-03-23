import { validationResult } from "express-validator";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import InventoryMovement from "../models/InventoryMovement.js";

export const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map((e) => e.msg).join(", "));
    }

    const {
      sku,
      name,
      category,
      stock,
      purchasePrice,
      unitMeasure,
      minStock,
      variables,
      description,
    } = req.body;

    const existingProduct = await Product.findOne({ sku: sku.trim().toUpperCase() });
    if (existingProduct) {
      res.status(409);
      throw new Error("Ya existe un producto con ese SKU");
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404);
      throw new Error("La categoría no existe");
    }

    const product = await Product.create({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      stock,
      purchasePrice,
      unitMeasure: unitMeasure.trim(),
      minStock: minStock || 0,
      variables: Array.isArray(variables) ? variables : [],
      description: description?.trim() || "",
    });

    if (Number(stock) > 0) {
      await InventoryMovement.create({
        product: product._id,
        type: "manual_adjustment",
        quantity: Number(stock),
        previousStock: 0,
        newStock: Number(stock),
        referenceType: "manual_adjustment",
        referenceId: "INITIAL_STOCK",
        note: "Stock inicial del producto",
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { search = "", category = "", stockStatus = "" } = req.query;

    const filter = {};

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { sku: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (stockStatus === "low") {
      filter.$expr = { $lte: ["$stock", "$minStock"] };
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, note = "" } = req.body;

    if (typeof quantity !== "number") {
      res.status(400);
      throw new Error("La cantidad debe ser numérica");
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404);
      throw new Error("Producto no encontrado");
    }

    const previousStock = product.stock;
    const newStock = previousStock + quantity;

    if (newStock < 0) {
      res.status(400);
      throw new Error("El ajuste dejaría el stock en negativo");
    }

    product.stock = newStock;
    await product.save();

    await InventoryMovement.create({
      product: product._id,
      type: "manual_adjustment",
      quantity,
      previousStock,
      newStock,
      referenceType: "manual_adjustment",
      referenceId: "MANUAL",
      note: note.trim() || "Ajuste manual de stock",
    });

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};