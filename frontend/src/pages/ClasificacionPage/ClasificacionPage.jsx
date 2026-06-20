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

      if (!usuario) {
        return alert("Usuario no encontrado.");
      }

      const kg = parseFloat(cantidadKg);
      const nuevoStock = parseFloat(categoriaSeleccionada.stock_kg || 0) + kg;

      await axios.put(
        `http://127.0.0.1:8000/api/residuos/${categoriaSeleccionada.id}/`,
        {
          tipo: categoriaSeleccionada.tipo,
          descripcion: categoriaSeleccionada.descripcion,
          precio_por_kilo: categoriaSeleccionada.precio_por_kilo,
          stock_kg: nuevoStock,
          reciclable: categoriaSeleccionada.reciclable,
        },
      );
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

      alert(
        `Se registraron ${kg} Kg de ${categoriaSeleccionada.tipo} para ${usuario.nombre}`,
      );

      // RESET
      setUsuarioSeleccionado("");
      setCantidadKg("");
      setPrecioTotal(0);
      setCategoriaSeleccionada(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error al registrar reciclaje");
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
