"use client";

import { useParams } from "next/navigation";
import SponsorForm from "../sponsor-form";

export default function EditarPatrocinador() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Editar patrocinador</h1>
          <p>Atualize os dados do parceiro.</p>
        </div>
      </div>
      <SponsorForm id={params.id} />
    </div>
  );
}
