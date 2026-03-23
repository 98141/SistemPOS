import Sale from "../models/Sales.js";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import { generateCode } from "../utils/generateCode.js";

export const createSale = async (req, res, next) => {
  try {
    const { items, discount = 0, paymentMethod = "efectivo", notes = "" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("Debes agregar productos a la venta");
    }

    const normalizedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { product: productId, quantity, unitPrice } = item;

      if (!productId || !quantity || quantity < 1 || unitPrice < 0) {
        res.status(400);
        throw new Error("Datos inválidos en uno de los productos de la venta");
      }

      const product = await Product.findById(productId);
      if (!product) {
        res.status(404);
        throw new Error("Uno de los productos no existe");
      }

      if (!product.isActive) {
        res.status(400);
        throw new Error(`El producto ${product.name} está inactivo`);
      }

      if (product.stock < Number(quantity)) {
        res.status(400);
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      const itemSubtotal = Number(quantity) * Number(unitPrice);
      const itemProfit = (Number(unitPrice) - Number(product.purchasePrice)) * Number(quantity);

      subtotal += itemSubtotal;

      const previousStock = product.stock;
      const newStock = previousStock - Number(quantity);

      product.stock = newStock;
      await product.save();

      normalizedItems.push({
        product: product._id,
        skuSnapshot: product.sku,
        nameSnapshot: product.name,
        unitMeasureSnapshot: product.unitMeasure,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        unitCostSnapshot: Number(product.purchasePrice),
        subtotal: itemSubtotal,
        profit: itemProfit,
      });

      await InventoryMovement.create({
        product: product._id,
        type: "sale",
        quantity: -Number(quantity),
        previousStock,
        newStock,
        referenceType: "sale",
        referenceId: "PENDING",
        note: "Salida por venta",
      });
    }

    const total = subtotal - Number(discount);
    if (total < 0) {
      res.status(400);
      throw new Error("El total de la venta no puede ser negativo");
    }

    const saleNumber = generateCode("VEN");

    const sale = await Sale.create({
      saleNumber,
      items: normalizedItems,
      subtotal,
      discount: Number(discount),
      total,
      paymentMethod,
      notes: notes.trim(),
    });

    await InventoryMovement.updateMany(
      { referenceId: "PENDING", referenceType: "sale" },
      { $set: { referenceId: sale.saleNumber } }
    );

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};