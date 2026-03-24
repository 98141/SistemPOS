import { useEffect, useState } from "react";
import api from "../../api/axios";
import Pagination from "../../components/common/Pagination";
import { getMovementTypeLabel } from "../../utils/labels";
import "./InventoryPage.css";

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    stockStatus: "",
  });
  const [movementFilters, setMovementFilters] = useState({
    search: "",
    type: "",
  });
  const [adjustForm, setAdjustForm] = useState({
    productId: "",
    quantity: "",
    note: "",
  });
  const [currentMovementPage, setCurrentMovementPage] = useState(1);
  const movementItemsPerPage = 12;

  const loadInventory = async () => {
    try {
      const { data } = await api.get("/inventory", {
        params: {
          search: filters.search,
          stockStatus: filters.stockStatus,
        },
      });
      setProducts(data.data);
    } catch (error) {
      console.error(error);
      alert("Error cargando inventario");
    }
  };

  const loadMovements = async () => {
    try {
      const { data } = await api.get("/inventory/movements", {
        params: {
          search: movementFilters.search,
          type: movementFilters.type,
        },
      });
      setMovements(data.data);
    } catch (error) {
      console.error(error);
      alert("Error cargando movimientos");
    }
  };

  useEffect(() => {
    loadInventory();
    loadMovements();
  }, []);

  const handleInventoryFilter = async (e) => {
    e.preventDefault();
    await loadInventory();
  };

  const handleMovementFilter = async (e) => {
    e.preventDefault();
    await loadMovements();
    setCurrentMovementPage(1);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();

    if (!adjustForm.productId) {
      alert("Selecciona un producto");
      return;
    }

    if (adjustForm.quantity === "" || Number(adjustForm.quantity) === 0) {
      alert("La cantidad no puede ser 0");
      return;
    }

    try {
      await api.patch(`/products/${adjustForm.productId}/stock`, {
        quantity: Number(adjustForm.quantity),
        note: adjustForm.note,
      });

      alert("Stock ajustado correctamente");

      setAdjustForm({
        productId: "",
        quantity: "",
        note: "",
      });

      await loadInventory();
      await loadMovements();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Error ajustando stock");
    }
  };

  const movementTotalPages =
    Math.ceil(movements.length / movementItemsPerPage) || 1;

  const paginatedMovements = movements.slice(
    (currentMovementPage - 1) * movementItemsPerPage,
    currentMovementPage * movementItemsPerPage
  );

  return (
    <section className="inventory-page">
      <h2 className="page-title">Inventario y movimientos</h2>

      <div className="inventory-top-grid">
        <form className="inventory-card" onSubmit={handleInventoryFilter}>
          <h3>Filtros de inventario</h3>

          <label>Buscar por nombre o SKU</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <label>Estado de stock</label>
          <select
            value={filters.stockStatus}
            onChange={(e) =>
              setFilters({ ...filters, stockStatus: e.target.value })
            }
          >
            <option value="">Todos</option>
            <option value="low">Stock bajo</option>
            <option value="out">Agotados</option>
          </select>

          <button type="submit">Filtrar inventario</button>
        </form>

        <form className="inventory-card" onSubmit={handleAdjustStock}>
          <h3>Ajuste manual de stock</h3>

          <label>Producto</label>
          <select
            value={adjustForm.productId}
            onChange={(e) =>
              setAdjustForm({ ...adjustForm, productId: e.target.value })
            }
          >
            <option value="">Seleccione</option>
            {products.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} - {item.sku}
              </option>
            ))}
          </select>

          <label>Cantidad a sumar o restar</label>
          <input
            type="number"
            value={adjustForm.quantity}
            onChange={(e) =>
              setAdjustForm({ ...adjustForm, quantity: e.target.value })
            }
            placeholder="Ej: 5 o -3"
          />

          <label>Observación</label>
          <textarea
            value={adjustForm.note}
            onChange={(e) =>
              setAdjustForm({ ...adjustForm, note: e.target.value })
            }
          />

          <button type="submit">Aplicar ajuste</button>
        </form>
      </div>

      <div className="inventory-card">
        <h3>Inventario actual</h3>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Unidad</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
                <th>Compra</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => {
                const lowStock = Number(item.stock) <= Number(item.minStock);
                const outStock = Number(item.stock) === 0;

                return (
                  <tr key={item._id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.category?.name || "-"}</td>
                    <td>{item.stock}</td>
                    <td>{item.unitMeasure}</td>
                    <td>{item.minStock}</td>
                    <td>
                      {outStock ? (
                        <span className="badge badge--danger">Agotado</span>
                      ) : lowStock ? (
                        <span className="badge badge--warning">Stock bajo</span>
                      ) : (
                        <span className="badge badge--success">Normal</span>
                      )}
                    </td>
                    <td>${Number(item.purchasePrice).toFixed(2)}</td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No hay productos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form className="inventory-card" onSubmit={handleMovementFilter}>
        <h3>Filtros de movimientos</h3>

        <div className="movement-filter-grid">
          <div>
            <label>Buscar por nombre o SKU</label>
            <input
              type="text"
              value={movementFilters.search}
              onChange={(e) =>
                setMovementFilters({ ...movementFilters, search: e.target.value })
              }
            />
          </div>

          <div>
            <label>Tipo</label>
            <select
              value={movementFilters.type}
              onChange={(e) =>
                setMovementFilters({ ...movementFilters, type: e.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="purchase">Compra</option>
              <option value="sale">Venta</option>
              <option value="manual_adjustment">Ajuste manual</option>
            </select>
          </div>

          <div className="movement-filter-action">
            <button type="submit">Filtrar movimientos</button>
          </div>
        </div>
      </form>

      <div className="inventory-card">
        <h3>Movimientos de inventario</h3>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>SKU</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock antes</th>
                <th>Stock después</th>
                <th>Referencia</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovements.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.createdAt).toLocaleString("es-CO")}</td>
                  <td>{item.product?.name || "-"}</td>
                  <td>{item.product?.sku || "-"}</td>
                  <td>{getMovementTypeLabel(item.type)}</td>
                  <td>{item.quantity}</td>
                  <td>{item.previousStock}</td>
                  <td>{item.newStock}</td>
                  <td>{item.referenceId || "-"}</td>
                  <td>{item.note || "-"}</td>
                </tr>
              ))}

              {movements.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty-row">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentMovementPage}
          totalPages={movementTotalPages}
          onPageChange={setCurrentMovementPage}
        />
      </div>
    </section>
  );
}

export default InventoryPage;