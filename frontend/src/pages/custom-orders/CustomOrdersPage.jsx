import { useEffect, useState } from "react";
import api from "../../api/axios";
import { getCustomOrderStatusLabel } from "../../utils/labels";
import "./CustomOrdersPage.css";

function CustomOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productName: "",
    description: "",
    quantity: 1,
    salePrice: 0,
    clientName: "",
    clientPhone: "",
    estimatedDate: "",
    status: "pending",
    notes: "",
  });

  const loadOrders = async () => {
    const { data } = await api.get("/custom-orders");
    setOrders(data.data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      await api.post("/custom-orders", {
        ...form,
        quantity: Number(form.quantity),
        salePrice: Number(form.salePrice),
        estimatedDate: form.estimatedDate || null,
      });

      setForm({
        productName: "",
        description: "",
        quantity: 1,
        salePrice: 0,
        clientName: "",
        clientPhone: "",
        estimatedDate: "",
        status: "pending",
        notes: "",
      });

      await loadOrders();
      alert("Pedido guardado correctamente");
    } catch (error) {
      alert(error?.response?.data?.message || "Error guardando pedido");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="custom-orders-page">
      <h2 className="page-title">Pedidos personalizados</h2>

      <div className="page-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>Nuevo pedido</h3>

          <label>Nombre del producto/pedido</label>
          <input
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            required
          />

          <label>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label>Cantidad</label>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />

          <label>Precio de venta</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.salePrice}
            onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            required
          />

          <label>Cliente</label>
          <input
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          />

          <label>Teléfono</label>
          <input
            value={form.clientPhone}
            onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
          />

          <label>Fecha estimada</label>
          <input
            type="date"
            value={form.estimatedDate}
            onChange={(e) => setForm({ ...form, estimatedDate: e.target.value })}
          />

          <label>Estado</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En proceso</option>
            <option value="completed">Completado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <label>Observaciones</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar pedido"}
          </button>
        </form>

        <div className="table-card">
          <h3>Listado de pedidos</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item) => (
                  <tr key={item._id}>
                    <td>{item.orderNumber}</td>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>${item.salePrice}</td>
                    <td>{item.clientName || "-"}</td>
                    <td>{getCustomOrderStatusLabel(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomOrdersPage;