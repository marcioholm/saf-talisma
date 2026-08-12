"use client";

import GameForm from "../game-form";

export default function NovoJogo() {
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Novo jogo</h1>
          <p>Cadastre um jogo ou resultado da agenda.</p>
        </div>
      </div>
      <GameForm />
    </div>
  );
}
