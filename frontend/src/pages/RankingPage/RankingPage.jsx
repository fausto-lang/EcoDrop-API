import { useState, useEffect } from "react";
import axios from "axios";
import style from "./RankingPage.module.css";

export function RankingPage() {
  const [usuarios, setUsuarios] = useState([]);

  /* useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/ranking/")
      .then((respuesta) => {
        setUsuarios(respuesta.data.ranking);
      })
      .catch((error) => {
        console.error("Error al traer el ranking:", error);
      });
  }, []); */

  const getPodiumClass = (index) => {
    if (index === 0) return style.firstPlace;
    if (index === 1) return style.secondPlace;
    if (index === 2) return style.thirdPlace;
    return "";
  };

  return (
    <div className={style.pageContainer}>
      <header className={style.header}>
        <h1 className={style.title}>Top Recicladores</h1>
        <p className={style.subtitle}>
          Descubre a los usuarios con mayor impacto ambiental
        </p>
      </header>

      <div className={style.tableWrapper}>
        <table className={style.table}>
          <thead>
            <tr>
              <th>Puesto</th>
              <th>Usuario</th>
              <th>Total Reciclado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user, index) => (
              <tr key={index} className={getPodiumClass(index)}>
                <td className={style.positionCell}>
                  <span className={style.positionBadge}>#{index + 1}</span>
                </td>
                <td className={style.userCell}>{user.username}</td>
                <td className={style.kilosCell}>{user.total_kilos} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
