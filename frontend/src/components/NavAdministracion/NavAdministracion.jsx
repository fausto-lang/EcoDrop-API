import { Link } from "react-router-dom";
import style from "./NavAdministracion.module.css";

export function NavAdministracion() {
  return (
    <div className={style.container}>
      <ul>
        <li className={style.active}>
          <Link>Residuos</Link>
        </li>
        <li>
          <Link>Usuarios</Link>
        </li>
      </ul>
    </div>
  );
}
