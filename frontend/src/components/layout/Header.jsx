import "./Header.css";

function Header() {
  const today = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="header">
      <div>
        <h1 className="header__title">Sistema POS</h1>
        <p className="header__subtitle">{today}</p>
      </div>
    </header>
  );
}

export default Header;