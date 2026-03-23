import Product from "../models/Product.js";
import Sale from "../models/Sales.js";
import Purchase from "../models/Purchase.js";
import CustomOrder from "../models/CustomOrder.js";
import InventoryMovement from "../models/InventoryMovement.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [salesToday, lowStockProducts, customOrdersPending, recentMovements] = await Promise.all([
      Sale.find({ date: { $gte: start, $lt: end } }),
      Product.find({ $expr: { $lte: ["$stock", "$minStock"] } }).limit(10).sort({ stock: 1 }),
      CustomOrder.countDocuments({ status: { $in: ["pending", "in_progress"] } }),
      InventoryMovement.find().populate("product", "name sku").sort({ createdAt: -1 }).limit(8),
    ]);

    const totalSalesToday = salesToday.reduce((acc, item) => acc + item.total, 0);
    const totalProfitToday = salesToday.reduce(
      (acc, sale) => acc + sale.items.reduce((sum, item) => sum + item.profit, 0),
      0
    );

    res.json({
      success: true,
      data: {
        totalSalesToday,
        totalProfitToday,
        salesCountToday: salesToday.length,
        lowStockProducts,
        customOrdersPending,
        recentMovements,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGeneralReports = async (req, res, next) => {
  try {
    const [products, sales, purchases, customOrders] = await Promise.all([
      Product.find(),
      Sale.find(),
      Purchase.find(),
      CustomOrder.find(),
    ]);

    const inventoryValue = products.reduce((acc, p) => acc + p.stock * p.purchasePrice, 0);
    const salesTotal = sales.reduce((acc, s) => acc + s.total, 0);
    const purchasesTotal = purchases.reduce((acc, p) => acc + p.total, 0);
    const totalProfit = sales.reduce(
      (acc, sale) => acc + sale.items.reduce((sum, item) => sum + item.profit, 0),
      0
    );

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        inventoryValue,
        salesTotal,
        purchasesTotal,
        totalProfit,
        customOrdersTotal: customOrders.length,
      },
    });
  } catch (error) {
    next(error);
  }
};