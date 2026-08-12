"use client";

import { useParams } from "next/navigation";
import TransparencyForm from "../transparency-form";

export default function EditarRegistro() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Editar registro</h1>
          <p>Atualize os dados e documentos.</p>
        </div>
      </div>
      <TransparencyForm id={params.id} />
    </div>
  );
}
