"use client";

import { useParams } from "next/navigation";
import PostForm from "../post-form";

export default function EditarNoticia() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Editar notícia</h1>
          <p>Altere os campos e salve as mudanças.</p>
        </div>
      </div>
      <PostForm id={params.id} />
    </div>
  );
}
