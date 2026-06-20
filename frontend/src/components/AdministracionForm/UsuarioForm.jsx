import style from "./ResiduoForm.module.css";

export function UsuarioForm({
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
          {editarId ? "Editar Usuario" : "Crear Usuario"}
        </h2>

        <div className={style.group}>
          <label htmlFor="Nombre">Nombre del usuario</label>
          <input
            id="nombre"
            name="nombre"
            placeholder="Escribe el nombre..."
            value={formData.nombre}
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
