import { validationResult } from "express-validator";
import Category from "../models/Category.js";

export const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map((e) => e.msg).join(", "));
    }

    const { name, description } = req.body;

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      res.status(409);
      throw new Error("La categoría ya existe");
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};