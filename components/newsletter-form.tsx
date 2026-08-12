"use client";

import { useState } from "react";
import { getAdminClient } from "../lib/admin-client";

type State = { status: "idle" | "loading" | "ok" | "error"; msg: string };

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle", msg: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState({ status: "loading", msg: "" });
    const { error } = await getAdminClient()
      .from("newsletter_subscribers")
      .insert({ email: email.trim() });
    if (error) {
      if (error.code === "23505") {
        setState({ status: "ok", msg: "Você já está inscrito!" });
      } else {
        setState({ status: "error", msg: "Não foi possível se inscrever. Tente novamente." });
      }
      return;
    }
    setState({ status: "ok", msg: "Inscrição confirmada. Bem-vindo(a) ao time!" });
    setEmail("");
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} aria-label="Assinar newsletter">
      <label htmlFor="newsletter-email">Fique por dentro de tudo</label>
      <div className="newsletter-row">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="Seu melhor email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.status === "loading"}
        />
        <button type="submit" className="button button-green" disabled={state.status === "loading"}>
          {state.status === "loading" ? "Enviando…" : "Assinar"}
        </button>
      </div>
      {state.status === "ok" && <p className="newsletter-msg ok">{state.msg}</p>}
      {state.status === "error" && <p className="newsletter-msg err">{state.msg}</p>}
    </form>
  );
}
