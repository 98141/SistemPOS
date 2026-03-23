import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";

import DashboardPage from "./pages/dashboard/DashboardPages";
import CategoriesPage from "./pages/categories/CategoriesPage";
import ProductsPage from "./pages/products/ProductsPage";
import PurchasesPage from "./pages/purchases/PurchasesPage";
import SalesPage from "./pages/sales/SalesPage";
import SalesHistoryPage from "./pages/history/SalesHistoryPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import CustomOrdersPage from "./pages/custom-orders/CustomOrdersPage";
import ReportsPage from "./pages/reports/ReportsPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales-history" element={<SalesHistoryPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/custom-orders" element={<CustomOrdersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}

export default App;