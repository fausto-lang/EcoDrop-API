import style from "./AdministracionUsuarios.module.css";
import { useAdministracion } from "../../hooks/useAdministracion";
import { useState } from "react";
import { UsuarioForm } from "../../components";

export function AdministracionUsuarios() {
  const { datos, crear, actualizar, eliminar } = useAdministracion("usuarios");
  const [modal, setModal] = useState(false);
  const [editarId, setEditarId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
  });

  const abrirCrear = () => {
    setFormData({
      nombre: "",
    });

    setEditarId(null);
    setModal(true);
  };

  const abrirEditar = (usuario) => {
    setFormData(usuario);
    setEditarId(usuario.id);
    setModal(true);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (editarId) {
      await actualizar(editarId, formData);
    } else {
      await crear(formData);
    }
    setModal(false);
    setEditarId(null);
  };

  return (
    <div className={style.container}>
      <header className={style.header}>
        <section>
          <h1 className={style.title}>Administrar Usuarios</h1>
          <p className={style.subtitle}>
            Gestiona y define a los usuarios del sistema.
          </p>
        </section>

        <button className={style.btn__add} onClick={abrirCrear}>
          <span className="material-symbols-outlined">add</span>
          Añadir
        </button>
      </header>

      <div className={style.list}>
        {datos.map((d) => (
          <div key={d.id} className={style.card_row}>
            <div className={style.user_info}>
              <p className={style.user_id}>ID: {d.id}</p>
              <h3 className={style.user_title}>{d.nombre}</h3>
            </div>

            <div className={style.user_metric}>
              <span className={style.card__value}>
                {d.total_reciclado}
                <span className={style.card__unit}> Kg</span>
              </span>
            </div>

            <div className={style.card__actions}>
              <button
                className={`${style.btn_action} ${style.btn_edit}`}
                onClick={() => {
                  abrirEditar(d);
                }}
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button
                className={`${style.btn_action} ${style.btn_delete}`}
                onClick={() => {
                  eliminar(d.id);
                }}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <UsuarioForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={enviar}
          onClose={() => setModal(false)}
          editarId={editarId}
        />
      )}
    </div>
  );
}
