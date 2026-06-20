import axios from "axios";

const API = "http://127.0.0.1:8000/api/usuarios/";

export const obtenerUsuarios = () => axios.get(API);
export const crearUsuario = (data) => axios.post(API, data);
export const actualizarUsuario = (id, data) => axios.put(`${API}${id}/`, data);
export const eliminarUsuario = (id) => axios.delete(`${API}${id}/`);
