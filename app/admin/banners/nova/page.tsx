"use client";

import BannerForm from "../banner-form";

export default function NovoBanner() {
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Novo banner</h1>
          <p>Adicione um banner à página inicial.</p>
        </div>
      </div>
      <BannerForm />
    </div>
  );
}
