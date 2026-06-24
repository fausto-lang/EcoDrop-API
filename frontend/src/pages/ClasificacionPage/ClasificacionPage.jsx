import { useState, useEffect, useRef } from "react";
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
  const [analizando, setAnalizando] = useState(false);

  // NUEVOS ESTADOS PARA LA CÁMARA EN LAPTOP
  const [encenderCamara, setEncenderCamara] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [grabando, setGrabando] = useState(false);
  const [analizandoVoz, setAnalizandoVoz] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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
        loading && setLoading(false);
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

  const handleSeleccionarImagen = (e) => {
    const file = e.target.files[0];
    if (file) setImagen(file);
  };

  // FUNCION PARA INICIAR WEBCAM EN LAPTOP
  const iniciarCamara = async () => {
    setEncenderCamara(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Intenta usar la trasera en movil, o la webcam en laptop
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert(
        "No se pudo acceder a la cámara. Revisa los permisos de tu navegador.",
      );
      setEncenderCamara(false);
    }
  };

  // FUNCION PARA CAPTURAR LA FOTO DE LA WEBCAM
  const capturarFoto = () => {
    if (videoRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "captura.jpg", { type: "image/jpeg" });
          setImagen(file);
          detenerCamara();
        }
      }, "image/jpeg");
    }
  };

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setEncenderCamara(false);
  };

  const enviarImagen = async () => {
    if (!imagen) return alert("No hay imagen");

    const formData = new FormData();
    formData.append("imagen", imagen);
    setAnalizando(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/clasificar/imagen/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const { residuo_id, error } = res.data;
      if (error) return alert(`La IA no pudo clasificar: ${error}`);
      if (!residuo_id) return alert("La IA no devolvió una categoría válida.");

      const categoriaDetectada = categorias.find(
        (c) => String(c.id) === String(residuo_id),
      );
      if (!categoriaDetectada)
        return alert("La categoría detectada no existe en el sistema.");

      setImagen(null);
      setUsuarioSeleccionado("");
      setCantidadKg("");
      setPrecioTotal(0);
      setCategoriaSeleccionada(categoriaDetectada);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error al conectar con la IA.");
    } finally {
      setAnalizando(false);
    }
  };

  // ── LOGICA DE AUDIO (MANTENIDA IGUAL) ──
  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await enviarAudio(audioBlob);
      };
      mediaRecorder.start();
      setGrabando(true);
    } catch (err) {
      alert("No se pudo acceder al micrófono. Verificá los permisos.");
      console.error(err);
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && grabando) {
      mediaRecorderRef.current.stop();
      setGrabando(false);
    }
  };

  const enviarAudio = async (audioBlob) => {
    setAnalizandoVoz(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "grabacion.webm");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/clasificar/voz/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const { residuo_id, cantidad_kg, error } = res.data;
      if (error) return alert(`La IA no pudo clasificar: ${error}`);
      if (!residuo_id) return alert("La IA no detectó ninguna categoría.");

      const categoriaDetectada = categorias.find(
        (c) => String(c.id) === String(residuo_id),
      );
      if (!categoriaDetectada)
        return alert("La categoría detectada no existe en el sistema.");

      setUsuarioSeleccionado("");
      setCantidadKg(cantidad_kg && cantidad_kg > 0 ? String(cantidad_kg) : "");
      setPrecioTotal(0);
      setCategoriaSeleccionada(categoriaDetectada);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error al conectar con la IA.");
    } finally {
      setAnalizandoVoz(false);
    }
  };

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
          {/* ── CARD IMAGEN (CORREGIDA) ── */}
          <div className={style.cardImage}>
            {analizando ? (
              <div className={style.loadingContainer}>
                <div className={style.spinner} />
                <p className={style.loadingText}>Analizando imagen con IA...</p>
              </div>
            ) : encenderCamara ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={style.img__preview}
                />
                <div className={style.buttonGroup}>
                  <button
                    type="button"
                    className={style.btnPrimary}
                    onClick={capturarFoto}
                  >
                    Tomar Foto
                  </button>
                  <button
                    type="button"
                    className={style.btnSecondary}
                    onClick={detenerCamara}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : !imagen ? (
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

                  <button
                    type="button"
                    className={style.btnSecondary}
                    onClick={iniciarCamara}
                  >
                    Abrir Cámara
                  </button>
                </div>
              </>
            ) : (
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

          {/* CARD VOZ */}
          <div className={style.cardVoice}>
            {analizandoVoz ? (
              <div className={style.loadingContainer}>
                <div className={style.spinner} />
                <p className={style.loadingText}>Analizando audio con IA...</p>
              </div>
            ) : (
              <>
                <div
                  className={`${style.iconCircle} ${style.voiceIcon} ${grabando ? style.voiceIcon__grabando : ""}`}
                >
                  <span className="material-symbols-outlined">
                    {grabando ? "stop_circle" : "mic"}
                  </span>
                </div>
                <h3>RECONOCIMIENTO POR VOZ</h3>
                <button
                  type="button"
                  className={grabando ? style.btnSecondary : style.btnPrimary}
                  onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                >
                  {grabando ? "Detener" : "Hablar"}
                </button>
              </>
            )}
          </div>

          {/* CARD CATEGORIAS */}
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

      {/* MODAL (MANTENIDO IGUAL) */}
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
              ></input>
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
