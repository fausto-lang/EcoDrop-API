import { useState, useEffect } from "react";
import axios from "axios";
import style from "./ClasificacionPage.module.css";

export function ClasificacionPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [cantidadKg, setCantidadKg] = useState("");
  const [precioTotal, setPrecioTotal] = useState(0);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/residuos/")
      .then((respuesta) => {
        setCategorias(respuesta.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar categorías:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada && cantidadKg) {
      const kg = parseFloat(cantidadKg) || 0;
      const precioPorKg =
        parseFloat(categoriaSeleccionada.precio_por_kilo) || 0;
      setPrecioTotal(kg * precioPorKg);
    } else {
      setPrecioTotal(0);
    }
  }, [cantidadKg, categoriaSeleccionada]);

  const handleSeleccionarCategoria = (cat) => {
    setCategoriaSeleccionada(cat);
    setNombreUsuario("");
    setCantidadKg("");
  };

  const handleConfirmarClasificacion = (e) => {
    e.preventDefault();
    if (!nombreUsuario || !cantidadKg)
      return alert("Por favor, llena todos los campos.");

    const payload = {
      residuo_id: categoriaSeleccionada.id,
      usuario_nombre: nombreUsuario,
      cantidad_kg: parseFloat(cantidadKg),
      precio_pagado: precioTotal,
    };

    console.log("Enviando registro de clasificación:", payload);

    alert(`¡Clasificación exitosa para ${nombreUsuario}!`);
    setCategoriaSeleccionada(null);
  };

  return (
    <div className={style.pageContainer}>
      <div className={style.mainContent}>
        <header className={style.header}>
          <h1 className={style.pageTitle}>Clasificación Inteligente</h1>
          <p className={style.pageSubtitle}>
            Utilice nuestra IA avanzada para identificar y procesar residuos de
            forma eficiente.
          </p>
        </header>

        <div className={style.bentoGrid}>
          <div className={style.cardImage}>
            <div className={style.iconCircle}>
              <span className="material-symbols-outlined">add_a_photo</span>
            </div>
            <h3>Reconocimiento por Imagen</h3>
            <p>
              Arrastre y suelte una fotografía del residuo o haga clic para
              capturar desde la cámara.
            </p>
            <div className={style.buttonGroup}>
              <button className={style.btnPrimary}>Subir Archivo</button>
              <button className={style.btnSecondary}>Abrir Cámara</button>
            </div>
          </div>

          <div className={style.cardVoice}>
            <div className={`${style.iconCircle} ${style.voiceIcon}`}>
              <span className="material-symbols-outlined">mic</span>
            </div>
            <h3>RECONOCIMIENTO POR VOZ</h3>
            <p>Diga el nombre del objeto para clasificar</p>
          </div>

          <div className={style.cardCategories}>
            <h4 className={style.sectionTitle}>Categorías Predefinidas</h4>
            {loading ? (
              <p className={style.loadingText}>Cargando categorías...</p>
            ) : (
              <div className={style.categoriesGrid}>
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    className={style.categoryButton}
                    onClick={() => handleSeleccionarCategoria(cat)}
                  >
                    <span className="material-symbols-outlined">
                      inventory_2
                    </span>
                    <span className={style.categoryName}>{cat.tipo}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {categoriaSeleccionada && (
        <div className={style.modalOverlay}>
          <form
            className={style.modalForm}
            onSubmit={handleConfirmarClasificacion}
          >
            <h3 className={style.modalTitle}>
              Reciclar: {categoriaSeleccionada.tipo}
            </h3>
            <p className={style.modalSubtitle}>
              Precio por kilo definido:{" "}
              <strong>
                ${parseFloat(categoriaSeleccionada.precio_por_kilo).toFixed(2)}
              </strong>
            </p>

            <div className={style.inputGroup}>
              <label htmlFor="nombreUsuario">Nombre del Reciclador</label>
              <input
                id="nombreUsuario"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                required
              />
            </div>

            <div className={style.inputGroup}>
              <label htmlFor="cantidadKg">Cantidad a Depositar (Kg)</label>
              <input
                id="cantidadKg"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cantidadKg}
                onChange={(e) => setCantidadKg(e.target.value)}
                required
              />
            </div>

            <div className={style.priceSummaryCard}>
              <span className={style.priceLabel}>
                Monto a pagar al usuario:
              </span>
              <span className={style.priceValue}>
                ${precioTotal.toFixed(2)}
              </span>
            </div>

            <div className={style.modalActions}>
              <button type="submit" className={style.btnModalConfirm}>
                Confirmar Registro
              </button>
              <button
                type="button"
                className={style.btnModalCancel}
                onClick={() => setCategoriaSeleccionada(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
