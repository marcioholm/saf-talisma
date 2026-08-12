"use client";

import TransparencyForm from "../transparency-form";

export default function NovoRegistro() {
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Novo registro de transparência</h1>
          <p>Cadastre convênios, repasses, doações e prestações de contas.</p>
        </div>
      </div>
      <TransparencyForm />
    </div>
  );
}
