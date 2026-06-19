import style from "./LayoutAdministracion.module.css";
import { NavAdministracion } from "../components/NavAdministracion/NavAdministracion";
import { Outlet } from "react-router-dom";

export function LayoutAdministracion() {
  return (
    <div className={style.container}>
      <NavAdministracion />
      <Outlet />
    </div>
  );
}
