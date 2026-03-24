import mongoose from "mongoose";
import Sale from "../models/Sales.js";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import { generateCode } from "../utils/generateCode.js";

export const createSale = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { items, discount = 0, paymentMethod = "efectivo", notes = "" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("Debes agregar productos a la venta");
    }

    let saleCreated = null;

    await session.withTransaction(async () => {
      const normalizedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const { product: productId, quantity, unitPrice } = item;

        if (!productId || Number(quantity) < 1 || Number(unitPrice) < 0) {
          throw new Error("Datos inválidos en uno de los productos de la venta");
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
          throw new Error("Uno de los productos no existe");
        }

        if (!product.isActive) {
          throw new Error(`El producto ${product.name} está inactivo`);
        }

        const qty = Number(quantity);
        const price = Number(unitPrice);

        if (product.stock < qty) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }

        const itemSubtotal = qty * price;
        const itemProfit = (price - Number(product.purchasePrice)) * qty;

        subtotal += itemSubtotal;

        normalizedItems.push({
          product: product._id,
          skuSnapshot: product.sku,
          nameSnapshot: product.name,
          unitMeasureSnapshot: product.unitMeasure,
          quantity: qty,
          unitPrice: price,
          unitCostSnapshot: Number(product.purchasePrice),
          subtotal: itemSubtotal,
          profit: itemProfit,
        });
      }

      const total = subtotal - Number(discount);
      if (total < 0) {
        throw new Error("El total de la venta no puede ser negativo");
      }

      const saleNumber = generateCode("VEN");

      const createdSales = await Sale.create(
        [
          {
            saleNumber,
            items: normalizedItems,
            subtotal,
            discount: Number(discount),
            total,
            paymentMethod,
            notes: notes.trim(),
          },
        ],
        { session }
      );

      saleCreated = createdSales[0];

      for (const item of normalizedItems) {
        const product = await Product.findById(item.product).session(session);

        const previousStock = product.stock;
        const newStock = previousStock - item.quantity;

        if (newStock < 0) {
          throw new Error(`El stock de ${product.name} no puede quedar negativo`);
        }

        product.stock = newStock;
        await product.save({ session });

        await InventoryMovement.create(
          [
            {
              product: product._id,
              type: "sale",
              quantity: -item.quantity,
              previousStock,
              newStock,
              referenceType: "sale",
              referenceId: saleCreated.saleNumber,
              note: "Salida por venta",
            },
          ],
          { session }
        );
      }
    });

    res.status(201).json({ success: true, data: saleCreated });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(400);
    }
    next(error);
  } finally {
    session.endSession();
  }
};

export const getSales = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentMethod, saleNumber } = req.query;

    const filter = {};

    if (saleNumber?.trim()) {
      filter.saleNumber = { $regex: saleNumber.trim(), $options: "i" };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    const sales = await Sale.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};