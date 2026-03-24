import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import { generateCode } from "../utils/generateCode.js";

export const createPurchase = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { items, notes = "" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("Debes enviar al menos un producto en la compra");
    }

    let purchaseCreated = null;

    await session.withTransaction(async () => {
      const normalizedItems = [];
      let total = 0;

      for (const item of items) {
        const { product: productId, quantity, unitCost } = item;

        if (!productId || Number(quantity) < 1 || Number(unitCost) < 0) {
          throw new Error("Datos inválidos en los productos de la compra");
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
          throw new Error("Uno de los productos no existe");
        }

        const qty = Number(quantity);
        const cost = Number(unitCost);
        const subtotal = qty * cost;

        total += subtotal;

        normalizedItems.push({
          product: product._id,
          skuSnapshot: product.sku,
          nameSnapshot: product.name,
          unitMeasureSnapshot: product.unitMeasure,
          quantity: qty,
          unitCost: cost,
          subtotal,
        });
      }

      const purchaseNumber = generateCode("COM");

      const createdPurchases = await Purchase.create(
        [
          {
            purchaseNumber,
            items: normalizedItems,
            total,
            notes: notes.trim(),
          },
        ],
        { session }
      );

      purchaseCreated = createdPurchases[0];

      for (const item of normalizedItems) {
        const product = await Product.findById(item.product).session(session);

        const previousStock = product.stock;
        const newStock = previousStock + item.quantity;

        product.stock = newStock;
        product.purchasePrice = item.unitCost;

        await product.save({ session });

        await InventoryMovement.create(
          [
            {
              product: product._id,
              type: "purchase",
              quantity: item.quantity,
              previousStock,
              newStock,
              referenceType: "purchase",
              referenceId: purchaseCreated.purchaseNumber,
              note: "Ingreso por compra",
            },
          ],
          { session }
        );
      }
    });

    res.status(201).json({ success: true, data: purchaseCreated });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(400);
    }
    next(error);
  } finally {
    session.endSession();
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