import { useEffect, useState } from "react";
import {
  obtenerResiduos,
  crearResiduo,
  actualizarResiduo,
  eliminarResiduo,
} from "../services/residuosService";

import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../services/usuarioService";

export function useAdministracion(tipo) {
  const [datos, setDatos] = useState([]);

  const cargar = async () => {
    try {
      const res =
        tipo === "residuos" ? await obtenerResiduos() : await obtenerUsuarios();

      setDatos(res.data || []);
    } catch (error) {
      console.error(error);
      setDatos([]);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (data) => {
    if (tipo === "residuos") {
      await crearResiduo(data);
    } else {
      await crearUsuario(data);
    }

    await cargar();
  };

  const actualizar = async (id, data) => {
    if (tipo === "residuos") {
      await actualizarResiduo(id, data);
    } else {
      await actualizarUsuario(id, data);
    }

    await cargar();
  };

  const eliminar = async (id) => {
    console.log("Eliminando:", id);

    if (tipo === "residuos") {
      await eliminarResiduo(id);
    } else {
      await eliminarUsuario(id);
    }

    setDatos((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    datos,
    crear,
    actualizar,
    eliminar,
    cargar,
  };
}
