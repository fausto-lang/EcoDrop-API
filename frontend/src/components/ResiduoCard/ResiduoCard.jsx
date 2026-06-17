import style from "./ResiduoCard.module.css";

export function ResiduoCard({ residuo, onEdit, onDelete }) {
  return (
    <article className={style.container}>
      <div className={style.header}>
        <h2 className={style.tipo}>{residuo.tipo}</h2>
        <p className={style.descripcion}>{residuo.descripcion}</p>
      </div>

      <section className={style.settings}>
        <button
          onClick={() => onEdit(residuo)}
          className={style.btnEdit}
          title="Editar"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>

        <button
          onClick={() => onDelete(residuo.id)}
          className={style.btnDelete}
          title="Eliminar"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </section>

      <footer className={style.footer}>
        <span className={style.stock}>{residuo.stock_kg}</span>
        <span className={style.unit}>Kg</span>
      </footer>
    </article>
  );
}
