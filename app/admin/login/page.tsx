"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "@/lib/admin-client";
import "../admin.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const client = getAdminClient();
      client.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          window.location.href = "/admin";
        }
      }).catch(() => {});
    } catch (_) {}
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      setError("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Autenticação via API Route no servidor (sempre estável e à prova de falhas)
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        setLoading(false);
        setError(data.error || "E-mail ou senha incorretos.");
        return;
      }

      // 2. Registra sessão no cliente Supabase e no localStorage
      if (data.session) {
        setSuccess(true);
        try {
          const client = getAdminClient();
          await client.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        } catch (e) {
          console.warn("Aviso ao definir sessão do client:", e);
        }

        try {
          localStorage.setItem("saf_admin_user_email", email.trim().toLowerCase());
        } catch (_) {}

        // 3. Redireciona imediatamente para o painel
        window.location.href = "/admin";
      } else {
        setLoading(false);
        setError("Não foi possível iniciar a sessão. Tente novamente.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Erro de conexão ao tentar autenticar. Tente novamente.");
    }
  }

  return (
    <div className="login-wrap">
      <form
        className="login-card"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        action="#"
      >
        <div className="login-brand-logo">
          <img src="/logo-saf.svg" alt="SAF Talismã" className="login-logo-img" />
        </div>
        
        <div className="login-header-badge">PAINEL ADMINISTRATIVO</div>
        <h1>SAF / TALISMÃ</h1>
        <p className="login-sub">Gestão e controle do portal oficial</p>

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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <button
          type="button"
          className="btn-login"
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? (success ? "Entrando no painel..." : "Autenticando…") : "Entrar no Painel"}
        </button>

        {error && (
          <div className="login-msg" role="alert">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
