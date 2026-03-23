import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import { generateCode } from "../utils/generateCode.js";

export const createPurchase = async (req, res, next) => {
  try {
    const { items, notes = "" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("Debes enviar al menos un producto en la compra");
    }

    const normalizedItems = [];
    let total = 0;

    for (const item of items) {
      const { product: productId, quantity, unitCost } = item;

      if (!productId || !quantity || quantity < 1 || unitCost < 0) {
        res.status(400);
        throw new Error("Datos inválidos en los productos de la compra");
      }

      const product = await Product.findById(productId);
      if (!product) {
        res.status(404);
        throw new Error("Uno de los productos no existe");
      }

      const subtotal = Number(quantity) * Number(unitCost);
      total += subtotal;

      const previousStock = product.stock;
      const newStock = previousStock + Number(quantity);

      product.stock = newStock;
      product.purchasePrice = Number(unitCost);
      await product.save();

      normalizedItems.push({
        product: product._id,
        skuSnapshot: product.sku,
        nameSnapshot: product.name,
        unitMeasureSnapshot: product.unitMeasure,
        quantity: Number(quantity),
        unitCost: Number(unitCost),
        subtotal,
      });

      await InventoryMovement.create({
        product: product._id,
        type: "purchase",
        quantity: Number(quantity),
        previousStock,
        newStock,
        referenceType: "purchase",
        referenceId: "PENDING",
        note: "Ingreso por compra",
      });
    }

    const purchaseNumber = generateCode("COM");
    const purchase = await Purchase.create({
      purchaseNumber,
      items: normalizedItems,
      total,
      notes: notes.trim(),
    });

    await InventoryMovement.updateMany(
      { referenceId: "PENDING", referenceType: "purchase" },
      { $set: { referenceId: purchase.purchaseNumber } }
    );

    res.status(201).json({ success: true, data: purchase });
  } catch (error) {
    next(error);
  }
};

export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json({ success: true, data: purchases });
  } catch (error) {
    next(error);
  }
};