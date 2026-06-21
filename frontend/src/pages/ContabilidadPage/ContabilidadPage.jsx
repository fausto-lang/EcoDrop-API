import React, { useState, useEffect } from "react";
import axios from "axios";
import { obtenerEstadisticas } from "../../services/contabilidadService";
import "./ContabilidadPage.css";

const ContabilidadPage = () => {
    // --- ESTADOS PARA EL FORMULARIO ---
    const [usuarioId, setUsuarioId] = useState("");
    const [residuoId, setResiduoId] = useState("");
    const [kilos, setKilos] = useState("");

    // --- NUEVOS ESTADOS PARA LAS LISTAS DESPLEGABLES ---
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [listaResiduos, setListaResiduos] = useState([]);

    // --- ESTADOS PARA LAS ESTADÍSTICAS ---
    const [estadisticas, setEstadisticas] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Función para cargar las estadísticas
    const cargarDatos = async () => {
        setCargando(true);
        const datos = await obtenerEstadisticas();
        if (datos) {
            setEstadisticas(datos);
        }
        setCargando(false);
    };

    // ¡AQUÍ ESTÁ EL FAMOSO useEffect!
    // Esto se ejecuta una sola vez cuando abres la página
    useEffect(() => {
        cargarDatos(); // Carga las tarjetas

        // Traer lista de usuarios del backend
        axios.get("http://127.0.0.1:8000/api/usuarios/")
            .then(respuesta => setListaUsuarios(respuesta.data))
            .catch(error => console.error("Error al traer usuarios:", error));

        // Traer lista de residuos del backend
        axios.get("http://127.0.0.1:8000/api/residuos/")
            .then(respuesta => setListaResiduos(respuesta.data))
            .catch(error => console.error("Error al traer residuos:", error));
    }, []);

    // Función para enviar el formulario
    const enviarDatos = (e) => {
        e.preventDefault();
        
        axios.post("http://127.0.0.1:8000/api/contabilidad/registrar/", {
            usuario: usuarioId,
            tipo_residuo: residuoId,
            kilos: parseFloat(kilos),
        })
        .then((respuesta) => {
            alert("¡Registro guardado con éxito! ♻️");
            setUsuarioId("");
            setResiduoId("");
            setKilos("");
            cargarDatos(); // Actualiza las estadísticas
        })
        .catch((error) => {
            console.error("Hubo un error al guardar:", error);
            alert("Error al guardar. Revisa la consola.");
        });
    };

    if (cargando && !estadisticas) {
        return <div style={{ color: 'var(--marca-principal)', textAlign: 'center', padding: '50px' }}>Cargando contabilidad...</div>;
    }

    return (
        <div className="contabilidad-container" style={{ padding: '20px', backgroundColor: 'var(--fondo-aplicacion)', minHeight: '100vh' }}>
            <h1 style={{ color: 'var(--marca-oscura)', marginBottom: '20px' }}>Gestión de Contabilidad</h1>

            {/* --- FORMULARIO CON MENÚS DESPLEGABLES --- */}
            <div style={{ backgroundColor: 'var(--fondo-blanco)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-borde)', marginBottom: '30px' }}>
                <h2 style={{ color: 'var(--texto-principal)', marginBottom: '15px' }}>Registrar Nuevo Movimiento</h2>
                <form onSubmit={enviarDatos} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    
                    {/* Select de Usuario */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                        <label style={{ color: 'var(--texto-atenuado)', marginBottom: '5px' }}>Usuario:</label>
                        <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-borde)', backgroundColor: 'white' }}>
                            <option value="">Seleccione un usuario...</option>
                            {listaUsuarios.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.nombre} {/* Ojo: Si en tu modelo de Django se llama 'username', cambia user.nombre por user.username */}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select de Residuo */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                        <label style={{ color: 'var(--texto-atenuado)', marginBottom: '5px' }}>Residuo:</label>
                        <select value={residuoId} onChange={(e) => setResiduoId(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-borde)', backgroundColor: 'white' }}>
                            <option value="">Seleccione un residuo...</option>
                            {listaResiduos.map(residuo => (
                                <option key={residuo.id} value={residuo.id}>
                                    {residuo.tipo} {/* Ojo: Si en tu modelo se llama 'nombre', cambia residuo.tipo por residuo.nombre */}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Input de Kilos */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '100px' }}>
                        <label style={{ color: 'var(--texto-atenuado)', marginBottom: '5px' }}>Kilos:</label>
                        <input type="number" step="0.01" value={kilos} onChange={(e) => setKilos(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-borde)' }} />
                    </div>

                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--marca-principal)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '35px' }}>
                        Guardar
                    </button>
                </form>
            </div>

            {/* --- SECCIÓN DE TARJETAS DE ESTADÍSTICAS --- */}
            {estadisticas ? (
                <>
                    <h2 style={{ color: 'var(--texto-principal)', marginBottom: '15px' }}>Resumen del Mes</h2>
                    <div className="tarjetas-grid" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                        <div className="tarjeta" style={{ backgroundColor: 'var(--fondo-blanco)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-borde)', flex: 1 }}>
                            <h3 style={{ color: 'var(--texto-atenuado)' }}>Ingresado este Mes</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--texto-principal)' }}>{estadisticas.mes_actual.ingresados_kg} kg</p>
                        </div>
                        <div className="tarjeta" style={{ backgroundColor: 'var(--estado-exito-fondo)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-borde)', flex: 1 }}>
                            <h3 style={{ color: 'var(--estado-exito-texto)' }}>Reciclado / Vendido</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--estado-exito-texto)' }}>{estadisticas.mes_actual.vendidos_kg} kg</p>
                        </div>
                        <div className="tarjeta" style={{ backgroundColor: 'var(--estado-alerta-fondo)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-borde)', flex: 1 }}>
                            <h3 style={{ color: 'var(--estado-alerta-texto)' }}>Pérdidas / Mermas</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--estado-alerta-texto)' }}>{estadisticas.mes_actual.perdidos_kg} kg</p>
                        </div>
                        <div className="tarjeta" style={{ backgroundColor: 'var(--marca-clara)', padding: '20px', borderRadius: '8px', border: '1px solid var(--marca-principal)', flex: 1 }}>
                            <h3 style={{ color: 'var(--marca-oscura)' }}>Ganancia del Mes</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--marca-principal)' }}>Bs. {estadisticas.mes_actual.ganancia_total}</p>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ color: 'var(--estado-alerta-texto)' }}>Esperando estadísticas del backend...</div>
            )}
        </div>
    );
};

export { ContabilidadPage };