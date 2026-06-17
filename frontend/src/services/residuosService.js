import axios from "axios";

const API = "http://127.0.0.1:8000/api/residuos/";

export const obtenerResiduos = () => axios.get(API);
export const crearResiduo = (data) => axios.post(API, data);
export const actualizarResiduo = (id, data) => axios.put(`${API}${id}/`, data);
export const eliminarResiduo = (id) => axios.delete(`${API}${id}/`);
