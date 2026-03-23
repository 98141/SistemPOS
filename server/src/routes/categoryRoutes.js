import express from "express";
import { body } from "express-validator";
import { createCategory, getCategories } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("description").optional().isString().withMessage("La descripción debe ser texto"),
  ],
  createCategory
);

export default router;