import express from "express";
import { createPurchase, getPurchases } from "../controllers/purchaseController.js";

const router = express.Router();

router.get("/", getPurchases);
router.post("/", createPurchase);

export default router;