import { useState, useEffect } from "react";
import axios from "axios";
import style from "./ClasificacionPage.module.css";

export function ClasificacionPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [cantidadKg, setCantidadKg] = useState("");
  const [precioTotal, setPrecioTotal] = useState(0);
  const [imagen, setImagen] = useState(null);
  const [analizando, setAnalizando] = useState(false); // ← nuevo estado

  const enviarImagen = async () => {
    if (!imagen) return alert("No hay imagen");

    const formData = new FormData();
    formData.append("imagen", imagen);

    setAnalizando(true); // ← empieza a cargar

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/clasificar/imagen/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const { residuo_id, error } = res.data;

      if (error) {
        return alert(`La IA no pudo clasificar: ${error}`);
      }

      if (!residuo_id) {
        return alert("La IA no devolvió una categoría válida.");
      }

      const categoriaDetectada = categorias.find(
        (c) => String(c.id) === String(residuo_id),
      );

      if (!categoriaDetectada) {
        return alert("La categoría detectada no existe en el sistema.");
      }

      setImagen(null);
      setUsuarioSeleccionado("");
      setCantidadKg("");
      setPrecioTotal(0);
      setCategoriaSeleccionada(categoriaDetectada);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error al conectar con la IA.");
    } finally {
      setAnalizando(false); // ← termina de cargar siempre
    }
  };

  const handleSeleccionarImagen = (e) => {
    const file = e.target.files[0];
    if (file) setImagen(file);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuariosRes, residuosRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/usuarios/"),
          axios.get("http://127.0.0.1:8000/api/residuos/"),
        ]);
        setUsuarios(usuariosRes.data);
        setCategorias(residuosRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada && cantidadKg) {
      const kg = parseFloat(cantidadKg) || 0;
      const precio = parseFloat(categoriaSeleccionada.precio_por_kilo) || 0;
      setPrecioTotal(kg * precio);
    } else {
      setPrecioTotal(0);
    }
  }, [cantidadKg, categoriaSeleccionada]);

  const handleSeleccionarCategoria = (cat) => {
    setCategoriaSeleccionada(cat);
    setUsuarioSeleccionado("");
    setCantidadKg("");
    setPrecioTotal(0);
  };

  const handleConfirmarClasificacion = async (e) => {
    e.preventDefault();

    if (!usuarioSeleccionado || !cantidadKg || !categoriaSeleccionada) {
      return alert("Por favor, llena todos los campos.");
    }

    try {
      const usuario = usuarios.find(
        (u) => String(u.id) === String(usuarioSeleccionado),
      );

      if (!usuario) return alert("Usuario no encontrado.");

      const kg = parseFloat(cantidadKg);

      await axios.post("http://127.0.0.1:8000/api/contabilidad/movimiento/", {
        usuario_id: usuarioSeleccionado,
        residuo_id: categoriaSeleccionada.id,
        kilos: kg,
      });

      const nuevoTotalUsuario = parseFloat(usuario.total_reciclado || 0) + kg;
      await axios.put(`http://127.0.0.1:8000/api/usuarios/${usuario.id}/`, {
        nombre: usuario.nombre,
        total_reciclado: nuevoTotalUsuario,
      });

      const [usuariosRes, residuosRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/usuarios/"),
        axios.get("http://127.0.0.1:8000/api/residuos/"),
      ]);

      setUsuarios(usuariosRes.data);
      setCategorias(residuosRes.data);
      setUsuarioSeleccionado("");
      setCantidadKg("");
      setPrecioTotal(0);
      setCategoriaSeleccionada(null);
    } catch (error) {
      console.error(error);
    }
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
            {/* ── Estado: analizando ── */}
            {analizando ? (
              <div className={style.loadingContainer}>
                <div className={style.spinner} />
                <p className={style.loadingText}>Analizando imagen con IA...</p>
              </div>
            ) : !imagen ? (
              /* ── Estado: sin imagen ── */
              <>
                <div className={style.iconCircle}>
                  <span className="material-symbols-outlined">add_a_photo</span>
                </div>
                <h3>Reconocimiento por Imagen</h3>
                <div className={style.buttonGroup}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSeleccionarImagen}
                    style={{ display: "none" }}
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className={style.btnPrimary}>
                    Subir Archivo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id="cameraInput"
                    style={{ display: "none" }}
                    onChange={handleSeleccionarImagen}
                  />
                  <label htmlFor="cameraInput" className={style.btnSecondary}>
                    Abrir Camara
                  </label>
                </div>
              </>
            ) : (
              /* ── Estado: imagen lista para enviar ── */
              <>
                <img
                  src={URL.createObjectURL(imagen)}
                  alt="preview"
                  className={style.img__preview}
                />
                <div className={style.buttonGroup}>
                  <button
                    type="button"
                    className={style.btnPrimary}
                    onClick={enviarImagen}
                  >
                    Enviar
                  </button>
                  <button
                    type="button"
                    className={style.btnSecondary}
                    onClick={() => setImagen(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
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

      {/* MODAL */}
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
              <label htmlFor="usuario">Reciclador</label>
              <select
                id="usuario"
                value={usuarioSeleccionado}
                onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                required
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={style.inputGroup}>
              <label htmlFor="cantidadKg">Cantidad a Depositar (Kg)</label>
              <input
                id="cantidadKg"
                type="number"
                min="0"
                step="0.01"
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
