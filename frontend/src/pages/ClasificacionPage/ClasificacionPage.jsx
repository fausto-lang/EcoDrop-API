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

  const [analizandoIA, setAnalizandoIA] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [analizandoVoz, setAnalizandoVoz] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [camaraActiva, setCamaraActiva] = useState(false);
  const [streamCamara, setStreamCamara] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

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
        console.error("Error al cargar datos iniciales:", error);
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

  // --- CÁMARA ---
  const handleAbrirCamara = async () => {
    setCamaraActiva(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStreamCamara(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert("No se pudo acceder a la cámara.");
      setCamaraActiva(false);
    }
  };

  const handleCapturarFoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "captura_camara.png", { type: "image/png" });
      handleCerrarCamara();
      await procesarImagenConIA(file);
    }, "image/png");
  };

  const handleCerrarCamara = () => {
    if (streamCamara) streamCamara.getTracks().forEach((track) => track.stop());
    setStreamCamara(null);
    setCamaraActiva(false);
  };

  // --- PROCESAMIENTO IA: IMAGEN ---
  const handleIAFileChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    await procesarImagenConIA(e.target.files[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const procesarImagenConIA = async (archivoImagen) => {
    const formData = new FormData();
    formData.append("imagen", archivoImagen);
    setAnalizandoIA(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/asistencia/clasificar/imagen/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { residuo_id } = response.data;
      const categoriaEncontrada = categorias.find((cat) => String(cat.id) === String(residuo_id));

      if (categoriaEncontrada) {
        setCategoriaSeleccionada(categoriaEncontrada);
        setCantidadKg(""); // Imagen deja los kilos vacíos
      } else {
        alert("La IA no pudo emparejar la imagen con ninguna categoría existente.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al clasificar la imagen.");
    } finally {
      setAnalizandoIA(false);
    }
  };

  // --- PROCESAMIENTO IA: VOZ ---
  const handleToggleVoz = async () => {
    if (grabando) {
      if (mediaRecorder) mediaRecorder.stop();
      setGrabando(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          const file = new File([audioBlob], "comando_voz.webm", { type: "audio/webm" });
          await procesarVozConIA(file);
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setGrabando(true);
      } catch (err) {
        console.error(err);
        alert("Permiso de micrófono denegado.");
      }
    }
  };

  const procesarVozConIA = async (archivoAudio) => {
    const formData = new FormData();
    formData.append("audio", archivoAudio);
    setAnalizandoVoz(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/asistencia/clasificar/voz/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { residuo_id, cantidad_kg } = response.data;
      const categoriaEncontrada = categorias.find((cat) => String(cat.id) === String(residuo_id));

      if (categoriaEncontrada) {
        setCategoriaSeleccionada(categoriaEncontrada);
        // Rellenar automáticamente los kilogramos obtenidos por la voz
        if (cantidad_kg && !isNaN(cantidad_kg)) {
          setCantidadKg(String(cantidad_kg));
        } else {
          setCantidadKg("");
        }
      } else {
        alert("La IA escuchó el mensaje pero el material no coincide con la base de datos.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al procesar el audio.");
    } finally {
      setAnalizandoVoz(false);
    }
  };

  const handleSeleccionarManual = (cat) => {
    setCategoriaSeleccionada(cat);
    setCantidadKg("");
    setPrecioTotal(0);
  };

  const handleConfirmarClasificacion = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado || !cantidadKg || !categoriaSeleccionada) {
      return alert("Faltan campos obligatorios para guardar el registro.");
    }

    try {
      const usuario = usuarios.find((u) => String(u.id) === String(usuarioSeleccionado));
      if (!usuario) return alert("Usuario inválido.");

      const kg = parseFloat(cantidadKg);
      const nuevoStock = parseFloat(categoriaSeleccionada.stock_kg || 0) + kg;

      // Actualizar Stock en Residuo
      await axios.put(`http://127.0.0.1:8000/api/residuos/${categoriaSeleccionada.id}/`, {
        tipo: categoriaSeleccionada.tipo,
        descripcion: categoriaSeleccionada.descripcion,
        precio_por_kilo: categoriaSeleccionada.precio_por_kilo,
        stock_kg: nuevoStock,
        reciclable: categoriaSeleccionada.reciclable,
      });

      // Actualizar Acumulado del Usuario
      const nuevoTotalUsuario = parseFloat(usuario.total_reciclado || 0) + kg;
      await axios.put(`http://127.0.0.1:8000/api/usuarios/${usuario.id}/`, {
        nombre: usuario.nombre,
        total_reciclado: nuevoTotalUsuario,
      });

      // Recargar datos actualizados
      const [usuariosRes, residuosRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/usuarios/"),
        axios.get("http://127.0.0.1:8000/api/residuos/"),
      ]);
      setUsuarios(usuariosRes.data);
      setCategorias(residuosRes.data);

      alert(`¡Registro Exitoso! Guardados ${kg} Kg de ${categoriaSeleccionada.tipo} para ${usuario.nombre}.`);
      setCantidadKg("");
      setPrecioTotal(0);
      setCategoriaSeleccionada(null);
    } catch (error) {
      console.error(error);
      alert("Error al guardar en la base de datos.");
    }
  };

  return (
    <div className={style.pageContainer}>
      <div className={style.mainContent}>
        <header className={style.header}>
          <h1 className={style.pageTitle}>Clasificación Inteligente</h1>
          <p className={style.pageSubtitle}>Procesamiento de reciclaje automatizado por Imagen y Voz.</p>
        </header>

        <div className={style.bentoGrid}>
          {/* TARJETA IMAGEN */}
          <div className={style.cardImage}>
            <div className={style.iconCircle}><span className="material-symbols-outlined">add_a_photo</span></div>
            <h3>Reconocimiento por Imagen</h3>
            <p>Suba una foto o use la cámara para detectar la categoría.</p>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleIAFileChange} style={{ display: "none" }} />
            <div className={style.buttonGroup}>
              <button className={style.btnPrimary} onClick={() => fileInputRef.current?.click()} disabled={analizandoIA || analizandoVoz}>
                {analizandoIA ? "Analizando..." : "Subir Archivo"}
              </button>
              <button className={style.btnSecondary} onClick={handleAbrirCamara} disabled={analizandoIA || analizandoVoz}>Abrir Cámara</button>
            </div>
          </div>

          {/* TARJETA VOZ */}
          <div 
            className={style.cardVoice}
            onClick={handleToggleVoz}
            style={{
              cursor: "pointer",
              outline: grabando ? "2px solid #ff4d4d" : "none",
              backgroundColor: grabando ? "#fffafb" : "#ffffff"
            }}
          >
            <div className={`${style.iconCircle} ${style.voiceIcon}`} style={{ backgroundColor: grabando ? "#ff4d4d" : "" }}>
              <span className="material-symbols-outlined" style={{ color: grabando ? "#ffffff" : "" }}>
                {grabando ? "stop" : analizandoVoz ? "hourglass_top" : "mic"}
              </span>
            </div>
            <h3>{analizandoVoz ? "PROCESANDO AUDIO..." : grabando ? "GRABANDO... (Clic para detener)" : "RECONOCIMIENTO POR VOZ"}</h3>
            <p>{grabando ? "Mencione el residuo y el peso (Ej: 'Vidrio 8 kilos')" : "Haga clic para hablar e identificar todo automáticamente."}</p>
          </div>

          {/* PANEL MANUAL */}
          <div className={style.cardCategories}>
            <h4 className={style.sectionTitle}>Categorías Predefinidas</h4>
            {loading ? (
              <p className={style.loadingText}>Cargando categorías...</p>
            ) : (
              <div className={style.categoriesGrid}>
                {categorias.map((cat) => (
                  <button key={cat.id} className={style.categoryButton} onClick={() => handleSeleccionarManual(cat)}>
                    <span className="material-symbols-outlined">inventory_2</span>
                    <span className={style.categoryName}>{cat.tipo}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CÁMARA */}
      {camaraActiva && (
        <div className={style.modalOverlay}>
          <div className={style.modalForm} style={{ maxWidth: "480px", alignItems: "center" }}>
            <h3 className={style.modalTitle}>Cámara en Vivo</h3>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: "12px", backgroundColor: "#0f172a" }} />
            <div className={style.modalActions} style={{ width: "100%", flexDirection: "row", gap: "1rem" }}>
              <button type="button" className={style.btnModalConfirm} style={{ flex: 1 }} onClick={handleCapturarFoto}>Tomar Foto</button>
              <button type="button" className={style.btnModalCancel} style={{ flex: 1 }} onClick={handleCerrarCamara}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {categoriaSeleccionada && (
        <div className={style.modalOverlay}>
          <form className={style.modalForm} onSubmit={handleConfirmarClasificacion}>
            <h3 className={style.modalTitle}>Reciclar: {categoriaSeleccionada.tipo}</h3>
            <p className={style.modalSubtitle}>
              Precio por kilo definido: <strong>${parseFloat(categoriaSeleccionada.precio_por_kilo).toFixed(2)}</strong>
            </p>

            <div className={style.inputGroup}>
              <label htmlFor="usuario">Reciclador</label>
              <select id="usuario" value={usuarioSeleccionado} onChange={(e) => setUsuarioSeleccionado(e.target.value)} required>
                <option value="">Seleccione un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
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
                placeholder="Ingresa los kilos manualmente"
                value={cantidadKg}
                onChange={(e) => setCantidadKg(e.target.value)}
                required
              />
            </div>

            <div className={style.priceSummaryCard}>
              <span className={style.priceLabel}>Monto a pagar al usuario:</span>
              <span className={style.priceValue}>${precioTotal.toFixed(2)}</span>
            </div>

            <div className={style.modalActions}>
              <button type="submit" className={style.btnModalConfirm}>Confirmar Registro</button>
              <button type="button" className={style.btnModalCancel} onClick={() => setCategoriaSeleccionada(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}