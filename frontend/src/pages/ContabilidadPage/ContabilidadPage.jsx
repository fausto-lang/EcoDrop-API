import React, { useState, useEffect } from "react";
import axios from "axios";
import "./contabilidadPage.css";

export function ContabilidadPage() {
  const [totales, setTotales] = useState({
    kilos_hoy: 0,
    kilos_mes: 0,
    reciclado_mes: 0,
    perdidas_mes: 0,
    ganancia_mes: 0,
  });

  const [vistaGrafico, setVistaGrafico] = useState("hoy");
  const [datosGrafico, setDatosGrafico] = useState({ hoy: [], mes: [] });
  const [entregasHoy, setEntregasHoy] = useState([]);
  const [residuosDisponibles, setResiduosDisponibles] = useState([]);
  const [residuoSeleccionado, setResiduoSeleccionado] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [cargandoVenta, setCargandoVenta] = useState(false);

  const cargarEstadisticas = () => {
    axios
      .get("http://127.0.0.1:8000/api/contabilidad/estadisticas/")
      .then((response) => {
        const datosDjango = response.data;
        setTotales({
          kilos_hoy: datosDjango.hoy.ingresados_kg,
          kilos_mes: datosDjango.mes_actual.ingresados_kg,
          reciclado_mes: datosDjango.mes_actual.vendidos_kg,
          ganancia_mes: datosDjango.mes_actual.ganancia_total,
        });

        if (datosDjango.entregas_hoy) {
          setEntregasHoy(datosDjango.entregas_hoy);
        }
      })
      .catch((error) => console.error("Error al cargar estadísticas:", error));
  };

  const cargarResiduosInventario = () => {
    axios
      .get("http://127.0.0.1:8000/api/residuos/")
      .then((response) => {
        setResiduosDisponibles(response.data);
        const datosDesdeInventario = response.data.map((residuo) => ({
          residuo__nombre: residuo.tipo,
          total: parseFloat(residuo.stock_kg) || 0,
        }));

        setDatosGrafico({
          hoy: datosDesdeInventario,
          mes: datosDesdeInventario,
        });
      })
      .catch((error) =>
        console.error("Error al cargar residuos para la gráfica:", error),
      );
  };

  useEffect(() => {
    cargarEstadisticas();
    cargarResiduosInventario();
  }, []);

  const handleRegistrarVenta = (e) => {
    e.preventDefault();
    if (!residuoSeleccionado || !precioVenta) {
      alert("Por favor, selecciona un material y define un precio de venta.");
      return;
    }

    setCargandoVenta(true);
    axios
      .post("http://127.0.0.1:8000/api/contabilidad/vender/", {
        residuo_id: residuoSeleccionado,
        precio_venta: precioVenta,
      })
      .then((res) => {
        setResiduoSeleccionado("");
        setPrecioVenta("");
        cargarEstadisticas();
        cargarResiduosInventario();
      })
      .catch((err) => {
        const msgErr =
          err.response?.data?.error || "Error al registrar la venta";
      })
      .finally(() => setCargandoVenta(false));
  };

  const datosActualesGrafica =
    vistaGrafico === "hoy" ? datosGrafico.hoy : datosGrafico.mes;

  return (
    <div className="dashboardContainer">
      <div className="dashboardHeader">
        <div>
          <h1 className="mainTitle">Balance de Recuperación</h1>
          <p className="subTitle">
            Seguimiento financiero y operativo de materiales procesados.
          </p>
        </div>
        <br />
        <br />
      </div>

      <div className="kpiGrid">
        <div className="kpiCard cardVerde">
          <div className="kpiHeader">
            <span className="badgeStatus">Hoy</span>
          </div>
          <span className="kpiLabel">INGRESADO HOY</span>
          <h2 className="kpiValue">{totales.kilos_hoy} kg</h2>
        </div>
        <div className="kpiCard cardAzul">
          <div className="kpiHeader">
            <span className="badgeStatus">Mes</span>
          </div>
          <span className="kpiLabel">INGRESADO ESTE MES</span>
          <h2 className="kpiValue">{totales.kilos_mes} kg</h2>
        </div>
        <div className="kpiCard cardAmarilla">
          <div className="kpiHeader">
            <span className="badgeStatus positivo">+4.2%</span>
          </div>
          <span className="kpiLabel">RECICLADO / VENDIDO</span>
          <h2 className="kpiValue">{totales.reciclado_mes} kg</h2>
        </div>
        <div className="kpiCard cardVerdeOscuro">
          <div className="kpiHeader">
            <span className="badgeStatus">Estable</span>
          </div>
          <span className="kpiLabel">GANANCIA DEL MES</span>
          <h2 className="kpiValue">Bs. {totales.ganancia_mes}</h2>
        </div>
      </div>

      <div className="dashboardContentGrid">
        <div className="contentBlock">
          <div className="blockHeader">
            <div>
              <h3>Stock Actual de Materiales</h3>
              <p className="blockSub">
                Distribución del peso total acumulado en inventario
              </p>
            </div>
            <div className="filterToggle">
              <button
                className={
                  vistaGrafico === "hoy" ? "toggleItem active" : "toggleItem"
                }
                onClick={() => setVistaGrafico("hoy")}
              >
                Hoy
              </button>
              <button
                className={
                  vistaGrafico === "mes" ? "toggleItem active" : "toggleItem"
                }
                onClick={() => setVistaGrafico("mes")}
              >
                Últimos 30 días
              </button>
            </div>
          </div>
          <div className="chartVisualArea">
            {datosActualesGrafica.length === 0 ? (
              <p className="emptyMessage">
                No hay residuos registrados en el inventario para graficar.
              </p>
            ) : (
              <div className="barChartContainer">
                {datosActualesGrafica.map((item, index) => (
                  <div key={index} className="chartRow">
                    <span className="labelMaterial">
                      {item.residuo__nombre}
                    </span>
                    <div className="barTrack">
                      <div
                        className="barFill"
                        style={{ width: `${Math.min(item.total * 2, 100)}%` }}
                      ></div>
                    </div>
                    <span className="weightValue">{item.total} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="contentBlock miniBlock">
            <div className="blockHeader">
              <h3>Ventas del Día</h3>
              <p className="blockSub">Usuarios que ingresaron materiales hoy</p>
            </div>
            <div
              className="deliveriesContainer"
              style={{ overflowY: "auto", maxHeight: "300px" }}
            >
              {entregasHoy.length === 0 ? (
                <p
                  className="emptyMessage"
                  style={{ textAlign: "center", marginTop: "20px" }}
                >
                  No se han registrado entregas el día de hoy.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {entregasHoy.map((entrega, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        borderLeft: "4px solid #28a745",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div>
                        <h4
                          style={{ margin: 0, color: "#333", fontSize: "14px" }}
                        >
                          {entrega.usuario_nombre}
                        </h4>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            background: "#e9ecef",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {entrega.material}
                        </span>
                      </div>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#28a745",
                          fontSize: "15px",
                        }}
                      >
                        +{entrega.kilos} kg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="contentBlock miniBlock">
            <div className="blockHeader">
              <h3>Registrar Venta</h3>
              <p className="blockSub">
                Despacha el stock acumulado y genera ingresos
              </p>
            </div>
            <form
              onSubmit={handleRegistrarVenta}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "10px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  Material:
                </label>
                <select
                  value={residuoSeleccionado}
                  onChange={(e) => setResiduoSeleccionado(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ced4da",
                    background: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  <option value="">Selecciona un material...</option>
                  {residuosDisponibles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.tipo} ({r.stock_kg} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  Precio de venta por kg (Bs.):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 4.50"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ced4da",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={cargandoVenta}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginTop: "5px",
                  transition: "background 0.2s",
                }}
              >
                {cargandoVenta
                  ? "Procesando despacho..."
                  : "Confirmar y Despachar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
