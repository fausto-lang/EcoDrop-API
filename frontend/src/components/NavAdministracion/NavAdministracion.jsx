import { Link, useLocation } from "react-router-dom";
import style from "./NavAdministracion.module.css";

export function NavAdministracion() {
  const location = useLocation().pathname;
  return (
    <div className={style.container}>
      <ul>
        <li
          className={
            location === "/administracion/residuos" ? style.active : ""
          }
        >
          <Link to={"/administracion/residuos"}>Residuos</Link>
        </li>
        <li
          className={
            location === "/administracion/usuarios" ? style.active : ""
          }
        >
          <Link to={"/administracion/usuarios"}>Usuarios</Link>
        </li>
      </ul>
    </div>
  );
}
