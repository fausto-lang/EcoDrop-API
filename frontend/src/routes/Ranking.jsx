import { useState, useEffect } from "react";
import axios from "axios";

export default function Ranking() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/ranking/")
      .then((respuesta) => {
        setUsuarios(respuesta.data.ranking);
      })
      .catch((error) => {
        console.error("Error al traer el ranking:", error);
      });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2d6a4f" }}>Top Recicladores</h1>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#d8f3dc", textAlign: "left" }}>
            <th style={{ padding: "12px", borderBottom: "2px solid #52b788" }}>Puesto</th>
            <th style={{ padding: "12px", borderBottom: "2px solid #52b788" }}>Usuario</th>
            <th style={{ padding: "12px", borderBottom: "2px solid #52b788" }}>Kilos</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "12px", fontWeight: "bold" }}>#{index + 1}</td>
              <td style={{ padding: "12px" }}>{user.username}</td>
              <td style={{ padding: "12px", color: "#1b4332", fontWeight: "bold" }}>
                {user.total_kilos} kg
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}