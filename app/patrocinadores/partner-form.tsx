"use client";

import { useState } from "react";

export function PartnerForm({ mailto }: { mailto: string }) {
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    telefone: "",
    email: "",
    mensagem: "",
  });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()) return;
    setSending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Erro ao enviar.");
      setForm({ nome: "", empresa: "", telefone: "", email: "", mensagem: "" });
      setMsg({ type: "ok", text: "Mensagem enviada! Entraremos em contato em breve." });
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Não foi possível enviar." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="partner-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="pf-nome">Nome *</label>
        <input
          id="pf-nome"
          value={form.nome}
          onChange={(e) => set("nome", e.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div className="field">
        <label htmlFor="pf-empresa">Empresa</label>
        <input
          id="pf-empresa"
          value={form.empresa}
          onChange={(e) => set("empresa", e.target.value)}
          autoComplete="organization"
        />
      </div>
      <div className="field">
        <label htmlFor="pf-email">E-mail *</label>
        <input
          id="pf-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="field">
        <label htmlFor="pf-telefone">Telefone</label>
        <input
          id="pf-telefone"
          value={form.telefone}
          onChange={(e) => set("telefone", e.target.value)}
          autoComplete="tel"
        />
      </div>
      <div className="field field-full">
        <label htmlFor="pf-mensagem">Mensagem *</label>
        <textarea
          id="pf-mensagem"
          value={form.mensagem}
          onChange={(e) => set("mensagem", e.target.value)}
          placeholder="Conte um pouco sobre sua empresa e o tipo de parceria desejada…"
          required
        />
      </div>
      {msg && <p className={`form-msg ${msg.type}`}>{msg.text}</p>}
      <button type="submit" className="button button-green" disabled={sending}>
        {sending ? "Enviando…" : "Enviar proposta →"}
      </button>
      <p className="fallback-mail">
        Prefere e-mail direto? Escreva para <a href={`mailto:${mailto}`}>{mailto}</a>
      </p>
    </form>
  );
}
