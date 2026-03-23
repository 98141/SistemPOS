import express from "express";
import { body } from "express-validator";
import {
  createProduct,
  getProducts,
  updateProductStock,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);

router.post(
  "/",
  [
    body("sku").trim().notEmpty().withMessage("El SKU es obligatorio"),
    body("name").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("category").notEmpty().withMessage("La categoría es obligatoria"),
    body("stock").isNumeric().withMessage("El stock debe ser numérico"),
    body("purchasePrice").isFloat({ min: 0 }).withMessage("Precio de compra inválido"),
    body("unitMeasure").trim().notEmpty().withMessage("La unidad de medida es obligatoria"),
  ],
  createProduct
);

router.patch("/:id/stock", updateProductStock);

export default router;