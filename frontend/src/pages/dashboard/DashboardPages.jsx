import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./DashboardPage.css";

function DashboardPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get("/reports/dashboard");
        setSummary(data.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  return (
    <section className="dashboard-page">
      <h2 className="page-title">Dashboard</h2>

      <div className="dashboard-grid">
        <article className="card">
          <h3>Ventas de hoy</h3>
          <p>${summary?.totalSalesToday ?? 0}</p>
        </article>

        <article className="card">
          <h3>Ganancia de hoy</h3>
          <p>${summary?.totalProfitToday ?? 0}</p>
        </article>

        <article className="card">
          <h3>Ventas realizadas hoy</h3>
          <p>{summary?.salesCountToday ?? 0}</p>
        </article>

        <article className="card">
          <h3>Pedidos pendientes</h3>
          <p>{summary?.customOrdersPending ?? 0}</p>
        </article>
      </div>
    </section>
  );
}

export default DashboardPage;