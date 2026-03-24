import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./PurchasesPage.css";

function PurchasesPage() {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [productsRes, purchasesRes] = await Promise.all([
        api.get("/products"),
        api.get("/purchases"),
      ]);

      setProducts(productsRes.data.data.filter((item) => item.isActive));
      setPurchases(purchasesRes.data.data);
    } catch (error) {
      console.error(error);
      alert("Error cargando datos de compras");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term)
    );
  }, [products, search]);

  const addToCart = (product) => {
    const exists = cart.find((item) => item.product === product._id);

    if (exists) {
      setCart((prev) =>
        prev.map((item) =>
          item.product === product._id
            ? { ...item, quantity: Number(item.quantity) + 1 }
            : item
        )
      );
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        product: product._id,
        sku: product.sku,
        name: product.name,
        unitMeasure: product.unitMeasure,
        currentStock: product.stock,
        quantity: 1,
        unitCost: product.purchasePrice || 0,
      },
    ]);
  };

  const updateCartItem = (productId, field, value) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product === productId ? { ...item, [field]: value } : item
      )
    );
  };

  const removeCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.product !== productId));
  };

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + Number(item.quantity || 0) * Number(item.unitCost || 0);
    }, 0);
  }, [cart]);

  const handleSubmit = async () => {
    if (loading) return;
    const invalidItem = cart.find(
      (item) => Number(item.quantity) < 1 || Number(item.unitCost) < 0
    );

    if (cart.length === 0) {
      alert("Agrega al menos un producto a la compra");
      return;
    }

    if (invalidItem) {
      alert("Revisa cantidades y costos unitarios");
      return;
    }

    try {
      setLoading(true);

      await api.post("/purchases", {
        items: cart.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
        notes,
      });

      alert("Compra registrada correctamente");
      setCart([]);
      setNotes("");
      setSearch("");
      await loadData();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Error registrando compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="purchases-page">
      <h2 className="page-title">Compras</h2>

      <div className="purchases-grid">
        <div className="purchase-panel">
          <div className="purchase-card">
            <h3>Buscar productos</h3>

            <input
              className="purchase-search"
              type="text"
              placeholder="Buscar por nombre o SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="purchase-product-list">
              {filteredProducts.map((item) => (
                <button
                  type="button"
                  key={item._id}
                  className="purchase-product-item"
                  onClick={() => addToCart(item)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.sku}</span>
                  <small>
                    Stock actual: {item.stock} {item.unitMeasure}
                  </small>
                  <small>Costo actual: ${Number(item.purchasePrice).toFixed(2)}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="purchase-panel">
          <div className="purchase-card">
            <h3>Detalle de compra</h3>

            <div className="purchase-cart-list">
              {cart.length === 0 && (
                <p className="empty-text">No hay productos agregados.</p>
              )}

              {cart.map((item) => {
                const subtotal =
                  Number(item.quantity || 0) * Number(item.unitCost || 0);

                return (
                  <div className="purchase-cart-item" key={item.product}>
                    <div className="purchase-cart-item__info">
                      <strong>{item.name}</strong>
                      <span>{item.sku}</span>
                      <small>
                        Stock actual: {item.currentStock} {item.unitMeasure}
                      </small>
                    </div>

                    <div className="purchase-cart-item__controls">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartItem(item.product, "quantity", e.target.value)
                        }
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) =>
                          updateCartItem(item.product, "unitCost", e.target.value)
                        }
                      />

                      <div className="purchase-subtotal">
                        ${subtotal.toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCartItem(item.product)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="purchase-summary">
              <label>Observaciones</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas de la compra"
              />

              <div className="purchase-total-box">
                <span>Total compra</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                className="purchase-confirm-btn"
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                >
                {loading ? "Guardando..." : "Registrar compra"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="purchase-history-card">
        <h3>Historial de compras</h3>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Items</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase._id}>
                  <td>{purchase.purchaseNumber}</td>
                  <td>{new Date(purchase.date).toLocaleString("es-CO")}</td>
                  <td>${Number(purchase.total).toFixed(2)}</td>
                  <td>{purchase.items.length}</td>
                  <td>{purchase.notes || "-"}</td>
                </tr>
              ))}

              {purchases.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No hay compras registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default PurchasesPage;