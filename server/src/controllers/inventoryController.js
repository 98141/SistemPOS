import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";

export const getInventory = async (req, res, next) => {
  try {
    const { search = "", stockStatus = "" } = req.query;

    const filter = {};

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { sku: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (stockStatus === "low") {
      filter.$expr = { $lte: ["$stock", "$minStock"] };
    }

    if (stockStatus === "out") {
      filter.stock = 0;
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getInventoryMovements = async (req, res, next) => {
  try {
    const { search = "", type = "" } = req.query;

    const movementFilter = {};
    let productIds = [];

    if (search.trim()) {
      const products = await Product.find({
        $or: [
          { name: { $regex: search.trim(), $options: "i" } },
          { sku: { $regex: search.trim(), $options: "i" } },
        ],
      }).select("_id");

      productIds = products.map((p) => p._id);
      movementFilter.product = { $in: productIds };
    }

    if (type) {
      movementFilter.type = type;
    }

    const movements = await InventoryMovement.find(movementFilter)
      .populate("product", "name sku unitMeasure")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, data: movements });
  } catch (error) {
    next(error);
  }
};