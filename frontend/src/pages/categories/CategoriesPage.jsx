import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/common/Toast";
import { useToast } from "../../hoots/useToast";
import "./CategoriesPage.css";

function CategoriesPage() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  const loadCategories = async () => {
    const { data } = await api.get("/categories");
    setCategories(data.data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const { data } = await api.post("/categories", form);
      setCategories((prev) => [data.data, ...prev]);
      setForm({ name: "", description: "" });
      showToast("Categoría guardada correctamente");
    } catch (error) {
      showToast(error?.response?.data?.message || "Error guardando categoría");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="categories-page">
      <h2 className="page-title">Clases / Categorías</h2>

      <div className="page-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>Nueva clase</h3>

          <label>Nombre</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </form>

        <div className="list-card">
          <h3>Listado</h3>
          <div className="simple-list">
            {categories.map((item) => (
              <div key={item._id} className="simple-item">
                <strong>{item.name}</strong>
                <span>{item.description || "Sin descripción"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toast.message && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={clearToast}
      />
      )}
    </section>
    
  );
}

export default CategoriesPage;