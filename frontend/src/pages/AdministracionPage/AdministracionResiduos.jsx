import { useState } from "react";
import style from "./AdministracionResiduos.module.css";
import { useAdministracion } from "../../hooks/useAdministracion";
import { ResiduoCard, ResiduoForm } from "../../components";

export function AdministracionResiduos() {
  const { datos, crear, actualizar, eliminar } = useAdministracion("residuos");

  const [modal, setModal] = useState(false);
  const [editarId, setEditarId] = useState(null);

  const [formData, setFormData] = useState({
    tipo: "",
    descripcion: "",
    precio_por_kilo: "",
    reciclable: false,
  });

  const abrirCrear = () => {
    setFormData({
      tipo: "",
      descripcion: "",
      precio_por_kilo: "",
      reciclable: false,
    });

    setEditarId(null);
    setModal(true);
  };

  const abrirEditar = (residuo) => {
    setFormData(residuo);
    setEditarId(residuo.id);
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
      <header>
        <section>
          <h1 className={style.title}>Administrar Residuos</h1>
          <p className={style.subtitle}>
            Gestiona y define los criterios de separación para toda la
            organización.
          </p>
        </section>

        <button onClick={abrirCrear} className={style.btn__add}>
          <span className="material-symbols-outlined">add</span>
          Añadir
        </button>
      </header>

      <section className={style.cards}>
        {(datos || []).map((r) => (
          <ResiduoCard
            key={r.id}
            residuo={r}
            onEdit={abrirEditar}
            onDelete={eliminar}
          />
        ))}
      </section>

      {modal && (
        <ResiduoForm
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
