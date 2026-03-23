import CustomOrder from "../models/CustomOrder.js";
import { generateCode } from "../utils/generateCode.js";

export const createCustomOrder = async (req, res, next) => {
  try {
    const {
      productName,
      description = "",
      quantity,
      salePrice,
      clientName = "",
      clientPhone = "",
      estimatedDate = null,
      status = "pending",
      notes = "",
    } = req.body;

    if (!productName?.trim()) {
      res.status(400);
      throw new Error("El nombre del pedido es obligatorio");
    }

    if (!quantity || Number(quantity) < 1) {
      res.status(400);
      throw new Error("La cantidad debe ser mayor a 0");
    }

    if (salePrice < 0) {
      res.status(400);
      throw new Error("El precio de venta no puede ser negativo");
    }

    const order = await CustomOrder.create({
      orderNumber: generateCode("PED"),
      productName: productName.trim(),
      description: description.trim(),
      quantity: Number(quantity),
      salePrice: Number(salePrice),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      estimatedDate: estimatedDate || null,
      status,
      notes: notes.trim(),
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getCustomOrders = async (req, res, next) => {
  try {
    const orders = await CustomOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};