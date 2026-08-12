"use client";

import PostForm from "../post-form";

export default function NovaNoticia() {
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Nova notícia</h1>
          <p>Preencha os campos abaixo para criar uma publicação.</p>
        </div>
      </div>
      <PostForm />
    </div>
  );
}
