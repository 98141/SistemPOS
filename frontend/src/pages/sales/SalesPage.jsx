import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./SalesPage.css";

function SalesPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [notes, setNotes] = useState("");

  const loadProducts = async () => {
    const { data } = await api.get("/products");
    setProducts(data.data.filter((item) => item.isActive && item.stock > 0));
  };

  useEffect(() => {
    loadProducts();
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
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        product: product._id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        quantity: 1,
        unitPrice: "",
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

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );

  const total = subtotal - Number(discount || 0);

  const handleSubmitSale = async () => {
    const invalidItem = cart.find(
      (item) =>
        !item.unitPrice ||
        Number(item.unitPrice) < 0 ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > Number(item.stock)
    );

    if (invalidItem) {
      alert("Revisa cantidades y precios del carrito");
      return;
    }

    await api.post("/sales", {
      items: cart.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      discount: Number(discount || 0),
      paymentMethod,
      notes,
    });

    alert("Venta registrada correctamente");
    setCart([]);
    setDiscount(0);
    setPaymentMethod("efectivo");
    setNotes("");
    loadProducts();
  };

  return (
    <section className="sales-page">
      <h2 className="page-title">Ventas POS</h2>

      <div className="sales-grid">
        <div className="sales-panel">
          <div className="card">
            <h3>Buscar producto</h3>
            <input
              className="sales-search"
              placeholder="Buscar por nombre o SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="product-list">
              {filteredProducts.map((item) => (
                <button
                  key={item._id}
                  className="product-item"
                  onClick={() => addToCart(item)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.sku}</span>
                  <small>
                    Stock: {item.stock} {item.unitMeasure}
                  </small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sales-panel">
          <div className="card">
            <h3>Carrito</h3>

            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.product}>
                  <div className="cart-item__info">
                    <strong>{item.name}</strong>
                    <span>{item.sku}</span>
                  </div>

                  <div className="cart-item__controls">
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        updateCartItem(item.product, "quantity", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Precio venta"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateCartItem(item.product, "unitPrice", e.target.value)
                      }
                    />

                    <button onClick={() => removeCartItem(item.product)}>Quitar</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="sale-summary">
              <label>Descuento</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />

              <label>Método de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="mixto">Mixto</option>
              </select>

              <label>Observaciones</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="totals">
                <p>Subtotal: ${subtotal.toFixed(2)}</p>
                <p>Total: ${total.toFixed(2)}</p>
              </div>

              <button className="confirm-btn" onClick={handleSubmitSale}>
                Confirmar venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SalesPage;