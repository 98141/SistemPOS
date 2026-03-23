import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./ProductsPage.css";

function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    stock: 0,
    purchasePrice: 0,
    unitMeasure: "",
    minStock: 0,
    description: "",
    variablesText: "",
  });

  const loadData = async () => {
    const [categoriesRes, productsRes] = await Promise.all([
      api.get("/categories"),
      api.get("/products"),
    ]);

    setCategories(categoriesRes.data.data);
    setProducts(productsRes.data.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const parseVariables = (text) => {
    if (!text.trim()) return [];
    return text
      .split(",")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [key, value] = pair.split(":");
        return {
          key: key?.trim() || "",
          value: value?.trim() || "",
        };
      })
      .filter((item) => item.key && item.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/products", {
      ...form,
      stock: Number(form.stock),
      purchasePrice: Number(form.purchasePrice),
      minStock: Number(form.minStock),
      variables: parseVariables(form.variablesText),
    });

    setForm({
      sku: "",
      name: "",
      category: "",
      stock: 0,
      purchasePrice: 0,
      unitMeasure: "",
      minStock: 0,
      description: "",
      variablesText: "",
    });

    loadData();
  };

  return (
    <section className="products-page">
      <h2 className="page-title">Productos</h2>

      <div className="products-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>Nuevo producto</h3>

          <label>SKU</label>
          <input
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
          />

          <label>Nombre</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>Categoría</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Seleccione</option>
            {categories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>

          <label>Stock inicial</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />

          <label>Precio de compra</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.purchasePrice}
            onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
            required
          />

          <label>Unidad de medida</label>
          <input
            value={form.unitMeasure}
            onChange={(e) => setForm({ ...form, unitMeasure: e.target.value })}
            placeholder="unidad, par, set..."
            required
          />

          <label>Stock mínimo</label>
          <input
            type="number"
            min="0"
            value={form.minStock}
            onChange={(e) => setForm({ ...form, minStock: e.target.value })}
          />

          <label>Variables</label>
          <input
            value={form.variablesText}
            onChange={(e) => setForm({ ...form, variablesText: e.target.value })}
            placeholder="color:café, tamaño:mediano"
          />

          <label>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button type="submit">Guardar producto</button>
        </form>

        <div className="table-card">
          <h3>Listado de productos</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Unidad</th>
                  <th>Compra</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item._id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.category?.name}</td>
                    <td>{item.stock}</td>
                    <td>{item.unitMeasure}</td>
                    <td>${item.purchasePrice}</td>
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

export default ProductsPage;