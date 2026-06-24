const API_URL = "http://localhost:8000/api";

export const obtenerEstadisticas = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/contabilidad/estadisticas/`);
    if (!respuesta.ok) {
      throw new Error("Error al conectar con el servidor");
    }
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Error al obtener las estadísticas:", error);
    return null;
  }
};
