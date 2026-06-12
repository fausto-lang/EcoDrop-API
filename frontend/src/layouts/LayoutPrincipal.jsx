import { Link, Outlet } from "react-router-dom";
import "./LayoutPrincipal.css";

export function LayoutPrincipal() {
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
            <li>
              <Link to="/">
                <span className="material-symbols-outlined">analytics</span>
                Clasificar
              </Link>
            </li>

            <li>
              <Link to="/administracion">
                <span className="material-symbols-outlined">
                  admin_panel_settings
                </span>
                Administración
              </Link>
            </li>

            <li>
              <Link to="/ranking">
                <span className="material-symbols-outlined">leaderboard</span>
                Ranking
              </Link>
            </li>
          </ul>
        </nav>

        <div className="pie-lateral">
          <ul className="navegacion-pie">
            <li>
              <Link to="#">
                <span className="material-symbols-outlined">help</span>
                Ayuda
              </Link>
            </li>
            <li>
              <Link to="#" className="cerrar-sesion">
                <span className="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <main className="contenido-principal">
        <Outlet />
      </main>
    </div>
  );
}
