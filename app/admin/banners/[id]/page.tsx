"use client";

import { useParams } from "next/navigation";
import BannerForm from "../banner-form";

export default function EditarBanner() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Editar banner</h1>
          <p>Atualize o banner da página inicial.</p>
        </div>
      </div>
      <BannerForm id={params.id} />
    </div>
  );
}
