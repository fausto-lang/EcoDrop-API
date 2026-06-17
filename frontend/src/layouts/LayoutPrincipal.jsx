import { Link, Outlet, useLocation } from "react-router-dom";
import "./LayoutPrincipal.css";

export function LayoutPrincipal() {
  const location = useLocation();
  return (
    <div className="contenedor-aplicacion">
      <aside className="barra-lateral">
        <div className="marca-lateral">
          <span className="material-symbols-outlined icono-logo">eco</span>
          <div>
            <h2>EcoDrop</h2>
            <p>Gestión de Residuos</p>
          </div>
        </div>

        <nav className="navegacion-lateral">
          <ul>
            <li className={location.pathname === "/" ? "active" : ""}>
              <Link to="/">
                <span className="material-symbols-outlined">analytics</span>
                Clasificar
              </Link>
            </li>

            <li
              className={
                location.pathname === "/administracion" ? "active" : ""
              }
            >
              <Link to="/administracion">
                <span className="material-symbols-outlined">
                  admin_panel_settings
                </span>
                Administración
              </Link>
            </li>

            <li className={location.pathname === "/ranking" ? "active" : ""}>
              <Link to="/ranking">
                <span className="material-symbols-outlined">leaderboard</span>
                Ranking
              </Link>
            </li>
            <li
              className={location.pathname === "/contabilidad" ? "active" : ""}
            >
              <Link to="/contabilidad">
                <span className="material-symbols-outlined">point_of_sale</span>
                Contabilidad
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="contenido-principal">
        <Outlet />
      </main>
    </div>
  );
}
