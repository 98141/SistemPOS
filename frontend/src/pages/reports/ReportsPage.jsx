import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./ReportsPage.css";

function ReportsPage() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data } = await api.get("/reports/general");
        setReport(data.data);
      } catch (error) {
        console.error(error);
        alert("Error cargando reportes");
      }
    };

    loadReport();
  }, []);

  return (
    <section className="reports-page">
      <h2 className="page-title">Reportes generales</h2>

      <div className="reports-grid">
        <article className="report-card">
          <h3>Total productos</h3>
          <p>{report?.totalProducts ?? 0}</p>
        </article>

        <article className="report-card">
          <h3>Valor del inventario</h3>
          <p>${Number(report?.inventoryValue ?? 0).toFixed(2)}</p>
        </article>

        <article className="report-card">
          <h3>Total ventas</h3>
          <p>${Number(report?.salesTotal ?? 0).toFixed(2)}</p>
        </article>

        <article className="report-card">
          <h3>Total compras</h3>
          <p>${Number(report?.purchasesTotal ?? 0).toFixed(2)}</p>
        </article>

        <article className="report-card">
          <h3>Ganancia estimada</h3>
          <p>${Number(report?.totalProfit ?? 0).toFixed(2)}</p>
        </article>

        <article className="report-card">
          <h3>Pedidos personalizados</h3>
          <p>{report?.customOrdersTotal ?? 0}</p>
        </article>
      </div>
    </section>
  );
}

export default ReportsPage;