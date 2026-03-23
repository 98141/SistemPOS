import express from "express";
import { createCustomOrder, getCustomOrders } from "../controllers/customOrderController.js";

const router = express.Router();

router.get("/", getCustomOrders);
router.post("/", createCustomOrder);

export default router;