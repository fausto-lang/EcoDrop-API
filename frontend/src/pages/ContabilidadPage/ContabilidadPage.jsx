import { useState } from "react";
import axios from "axios";

export function ContabilidadPage() {
  // Aquí guardamos lo que el usuario escribe en el formulario
  const [usuarioId, setUsuarioId] = useState("");
  const [residuoId, setResiduoId] = useState("");
  const [kilos, setKilos] = useState("");

  const enviarDatos = (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar

    // Aquí le enviamos los datos a Django (Asegúrate de tener esta URL en tu urls.py)
    axios
      .post("http://127.0.0.1:8000/api/contabilidad/registrar/", {
        usuario: usuarioId,
        tipo_residuo: residuoId,
        kilos: parseFloat(kilos),
      })
      .then((respuesta) => {
        alert("¡Registro guardado con éxito! ♻️");
        // Limpiamos el formulario
        setUsuarioId("");
        setResiduoId("");
        setKilos("");
      })
      .catch((error) => {
        console.error("Hubo un error al guardar:", error);
        alert("Error al guardar. Revisa la consola.");
      });
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2d6a4f" }}>⚖️ Registro de Contabilidad</h1>
      <p>Ingresa los datos de la recolección para calcular ganancias.</p>

      <form
        onSubmit={enviarDatos}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "400px",
          marginTop: "20px",
        }}
      >
        <div>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            ID del Usuario:
          </label>
          <input
            type="number"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            placeholder="Ej: 1"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            ID del Tipo de Residuo:
          </label>
          <input
            type="number"
            value={residuoId}
            onChange={(e) => setResiduoId(e.target.value)}
            placeholder="Ej: 2 (Plástico, Cartón...)"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Kilos Reciclados:
          </label>
          <input
            type="number"
            step="0.1"
            value={kilos}
            onChange={(e) => setKilos(e.target.value)}
            placeholder="Ej: 5.5"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#52b788",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Guardar Registro
        </button>
      </form>
    </div>
  );
}
