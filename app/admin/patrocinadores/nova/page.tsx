"use client";

import SponsorForm from "../sponsor-form";

export default function NovoPatrocinador() {
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Novo patrocinador</h1>
          <p>Cadastre um parceiro ou apoiador.</p>
        </div>
      </div>
      <SponsorForm />
    </div>
  );
}
