"use client";

import { useParams } from "next/navigation";
import GameForm from "../game-form";

export default function EditarJogo() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Editar jogo</h1>
          <p>Atualize os dados do jogo.</p>
        </div>
      </div>
      <GameForm id={params.id} />
    </div>
  );
}
