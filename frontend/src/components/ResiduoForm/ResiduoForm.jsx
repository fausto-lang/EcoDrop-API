import style from "./ResiduoForm.module.css";

export function ResiduoForm({
  formData,
  setFormData,
  onSubmit,
  onClose,
  editarId,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={style.container}>
      <form onSubmit={onSubmit} className={style.form}>
        <h2 className={style.title}>
          {editarId ? "Editar Residuo" : "Crear Residuo"}
        </h2>

        <div className={style.group}>
          <label htmlFor="tipo">Tipo de Residuo</label>
          <input
            id="tipo"
            name="tipo"
            placeholder="Ej. Plástico, Cartón..."
            value={formData.tipo}
            onChange={handleChange}
          />
        </div>

        <div className={style.group}>
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            placeholder="Detalles sobre el residuo..."
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>

        <div className={style.group}>
          <label htmlFor="precio_por_kilo">Precio por Kilo ($)</label>
          <input
            id="precio_por_kilo"
            type="number"
            name="precio_por_kilo"
            placeholder="0.00"
            step="0.01"
            value={formData.precio_por_kilo}
            onChange={handleChange}
          />
        </div>

        <div className={style.actions}>
          <button type="submit" className={style.submitBtn}>
            {editarId ? "Actualizar" : "Crear"}
          </button>

          <button type="button" onClick={onClose} className={style.closeBtn}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
