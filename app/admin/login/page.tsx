"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "../../../lib/admin-client";
import "../admin.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAdminClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) window.location.replace("/admin");
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await getAdminClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos."
          : error.message,
      );
      return;
    }
    window.location.replace("/admin");
  }

  return (
    <main className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="mark" aria-hidden="true">
            <span className="mark-star">★</span>
            <strong>SAF</strong>
            <span>TALISMÃ</span>
          </div>
        </div>
        <h1>Painel</h1>
        <p className="login-sub">Área restrita da SAF Talismã</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <div className="login-msg" role="alert">
          {error}
        </div>
      </form>
    </main>
  );
}
