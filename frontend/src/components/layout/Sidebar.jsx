import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/categories", label: "Clases" },
  { to: "/products", label: "Productos" },
  { to: "/purchases", label: "Compras" },
  { to: "/sales", label: "Ventas POS" },
  { to: "/sales-history", label: "Historial ventas" },
  { to: "/inventory", label: "Inventario" },
  { to: "/custom-orders", label: "Pedidos personalizados" },
  { to: "/reports", label: "Reportes" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar__brand">POS Artesanal</h2>

      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;