"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "@/lib/admin-client";
import "../admin.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultEmail = "marketing.northway@gmail.com";
  const defaultPass = "saftalisma2026!";

  useEffect(() => {
    getAdminClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) window.location.replace("/admin");
      });
  }, []);

  function handleFillCredentials() {
    setEmail(defaultEmail);
    setPassword(defaultPass);
    setError("");
  }

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
        <div className="login-brand-logo">
          <img src="/logo-saf.svg" alt="SAF Talismã" className="login-logo-img" />
        </div>
        
        <div className="login-header-badge">PAINEL ADMINISTRATIVO</div>
        <h1>SAF / TALISMÃ</h1>
        <p className="login-sub">Gestão e controle do portal oficial</p>

        {/* Card de credenciais oficiais fornecidas */}
        <div className="login-credentials-box">
          <div className="login-cred-head">
            <span className="login-cred-title">🔑 Acesso Oficial Liberado</span>
            <button
              type="button"
              className="btn-fill-cred"
              onClick={handleFillCredentials}
              title="Preencher automaticamente"
            >
              Preencher dados
            </button>
          </div>
          <div className="login-cred-row">
            <span>E-mail:</span>
            <code>{defaultEmail}</code>
          </div>
          <div className="login-cred-row">
            <span>Senha:</span>
            <code>{defaultPass}</code>
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">E-mail de Acesso</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu.email@saftalisma.com.br"
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
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? "Autenticando…" : "Entrar no Painel ➔"}
        </button>

        {error && (
          <div className="login-msg" role="alert">
            {error}
          </div>
        )}
      </form>
    </main>
  );
}
