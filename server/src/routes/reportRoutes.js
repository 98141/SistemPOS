import express from "express";
import { getDashboardSummary, getGeneralReports } from "../controllers/reportController.js";

const router = express.Router();

router.get("/dashboard", getDashboardSummary);
router.get("/general", getGeneralReports);

export default router;