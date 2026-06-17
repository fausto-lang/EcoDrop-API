import { useEffect, useState } from "react";
import {
  obtenerResiduos,
  crearResiduo,
  actualizarResiduo,
  eliminarResiduo,
} from "../services/residuosService";

export function useResiduos() {
  const [residuos, setResiduos] = useState([]);

  const cargar = async () => {
    const res = await obtenerResiduos();
    setResiduos(res.data);
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (data) => {
    await crearResiduo(data);
    cargar();
  };

  const actualizar = async (id, data) => {
    await actualizarResiduo(id, data);
    cargar();
  };

  const eliminar = async (id) => {
    await eliminarResiduo(id);
    setResiduos((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    residuos,
    crear,
    actualizar,
    eliminar,
    cargar,
  };
}
