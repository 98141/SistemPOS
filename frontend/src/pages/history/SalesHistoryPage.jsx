import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { exportSalesToPdf } from "../../utils/exportSalesToPDF";
import "./SalesHistoryPage.css";

function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
    saleNumber: "",
  });

  const loadSales = async () => {
    try {
      const params = {};

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.saleNumber) params.saleNumber = filters.saleNumber;

      const { data } = await api.get("/sales", { params });
      setSales(data.data);
    } catch (error) {
      console.error(error);
      alert("Error cargando historial de ventas");
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const totalSales = useMemo(() => {
    return sales.reduce((acc, sale) => acc + Number(sale.total), 0);
  }, [sales]);

  const totalProfit = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const saleProfit = sale.items.reduce(
        (sum, item) => sum + Number(item.profit || 0),
        0
      );
      return acc + saleProfit;
    }, 0);
  }, [sales]);

  const handleFilter = async (e) => {
    e.preventDefault();
    await loadSales();
  };

  return (
    <section className="sales-history-page">
      <h2 className="page-title">Historial de ventas</h2>

      <div className="history-summary-grid">
        <div className="history-card">
          <h3>Total ventas</h3>
          <p>${totalSales.toFixed(2)}</p>
        </div>
        <div className="history-card">
          <h3>Ganancia estimada</h3>
          <p>${totalProfit.toFixed(2)}</p>
        </div>
        <div className="history-card">
          <h3>Cantidad de ventas</h3>
          <p>{sales.length}</p>
        </div>
      </div>

      <form className="history-filters" onSubmit={handleFilter}>
        <div>
          <label>Número de venta</label>
          <input
            type="text"
            value={filters.saleNumber}
            onChange={(e) =>
              setFilters({ ...filters, saleNumber: e.target.value })
            }
          />
        </div>
        <div>
          <label>Fecha inicio</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
        </div>

        <div>
          <label>Fecha fin</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>

        <div>
          <label>Método de pago</label>
          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              setFilters({ ...filters, paymentMethod: e.target.value })
            }
          >
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="nequi">Nequi</option>
            <option value="daviplata">Daviplata</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>

        <button type="submit">Filtrar</button>
      </form>

      <div className="history-table-card">
        <div className="history-actions">
          <button
            type="button"
            className="pdf-btn"
            onClick={() => exportSalesToPdf(sales)}
          >
            Exportar PDF
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Subtotal</th>
                <th>Descuento</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Items</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td>{sale.saleNumber}</td>
                  <td>{new Date(sale.date).toLocaleString("es-CO")}</td>
                  <td>${Number(sale.subtotal).toFixed(2)}</td>
                  <td>${Number(sale.discount).toFixed(2)}</td>
                  <td>${Number(sale.total).toFixed(2)}</td>
                  <td>{sale.paymentMethod}</td>
                  <td>{sale.items.length}</td>
                  <td>
                    <button
                      type="button"
                      className="detail-btn"
                      onClick={() => setSelectedSale(sale)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No hay ventas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="history-modal-backdrop" onClick={() => setSelectedSale(null)}>
          <div
            className="history-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="history-modal__header">
              <h3>Detalle de venta {selectedSale.saleNumber}</h3>
              <button type="button" onClick={() => setSelectedSale(null)}>
                X
              </button>
            </div>

            <div className="history-modal__body">
              <p><strong>Fecha:</strong> {new Date(selectedSale.date).toLocaleString("es-CO")}</p>
              <p><strong>Método de pago:</strong> {selectedSale.paymentMethod}</p>
              <p><strong>Observaciones:</strong> {selectedSale.notes || "-"}</p>

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio venta</th>
                      <th>Costo</th>
                      <th>Subtotal</th>
                      <th>Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.skuSnapshot}</td>
                        <td>{item.nameSnapshot}</td>
                        <td>{item.quantity}</td>
                        <td>${Number(item.unitPrice).toFixed(2)}</td>
                        <td>${Number(item.unitCostSnapshot).toFixed(2)}</td>
                        <td>${Number(item.subtotal).toFixed(2)}</td>
                        <td>${Number(item.profit).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="history-modal__totals">
                <p><strong>Subtotal:</strong> ${Number(selectedSale.subtotal).toFixed(2)}</p>
                <p><strong>Descuento:</strong> ${Number(selectedSale.discount).toFixed(2)}</p>
                <p><strong>Total:</strong> ${Number(selectedSale.total).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SalesHistoryPage;