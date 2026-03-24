import express from "express";
import { getInventory, getInventoryMovements } from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);
router.get("/movements", getInventoryMovements);

export default router;