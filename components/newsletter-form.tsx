"use client";

import { useState, useEffect, useRef } from "react";
import { verifyTurnstile } from "@/lib/turnstile";

interface NewsletterFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

export function NewsletterForm({ onSuccess, onError }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "active" | "error">("idle");
  const [error, setError] = useState<string>("");

  const honeypot = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (honeypot.current) {
      honeypot.current.value = "";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot.current && honeypot.current.value.trim() !== "") {
      setError("Requisição inválida.");
      setStatus("error");
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const emailValue = (formData.get("email") as string || email).trim();
    const turnstileTokenValue = formData.get("cf-turnstile-response") as string;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailRegex.test(emailValue)) {
      setError("Por favor, insira um e-mail válido.");
      setSubmitting(false);
      setStatus("error");
      return;
    }

    if (emailValue.length > 254) {
      setError("E-mail muito longo.");
      setSubmitting(false);
      setStatus("error");
      return;
    }

    if (turnstileTokenValue) {
      const validation = await verifyTurnstile({
        token: turnstileTokenValue,
        hostname: window.location.hostname,
        action: "newsletter",
      });

      if (!validation.success) {
        setError("Verificação de segurança falhou. Tente novamente.");
        setSubmitting(false);
        setStatus("error");
        return;
      }
    }

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailValue,
          turnstile_token: turnstileTokenValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao inscrever na newsletter.");
        setStatus("error");
        setSubmitting(false);
        onError?.(result.error);
        return;
      }

      setStatus("pending");
      setEmail("");
      setSubmitting(false);
      onSuccess?.(emailValue);
    } catch {
      setError("Erro de conexão. Tente novamente mais tarde.");
      setStatus("error");
      setSubmitting(false);
      onError?.("Erro de conexão");
    }
  };

  return (
    <form
      className="newsletter-box"
      onSubmit={handleSubmit}
      aria-label="Inscreva-se na newsletter"
      noValidate
    >
      <div className="newsletter-head">
        <h3 className="newsletter-title">Receba as novidades da Associação</h3>
        <p className="newsletter-desc">
          Inscreva-se para receber notícias, jogos, campeonatos, projetos e novidades da Associação Esportiva SAF/Talismã.
        </p>
      </div>

      <div className="newsletter-fields">
        <label htmlFor="newsletter-email" className="sr-only">
          E-mail
        </label>
        <input
          type="email"
          id="newsletter-email"
          name="email"
          className="newsletter-input"
          placeholder="Digite seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          required
        />

        <input
          type="text"
          name="bot-field"
          className="hidden-field"
          style={{ display: "none" }}
          aria-hidden="true"
          ref={honeypot}
          tabIndex={-1}
          autoComplete="off"
        />

        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div
            className="turnstile-wrapper"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="newsletter-btn"
        >
          {submitting ? "Enviando..." : "Quero receber novidades"}
        </button>
      </div>

      <p className="newsletter-privacy">
        Ao se inscrever, você concorda em receber comunicações da Associação. Você poderá cancelar a inscrição a qualquer momento.
      </p>

      {error && (
        <p className="newsletter-msg newsletter-error" role="alert">
          {error}
        </p>
      )}

      {status === "pending" && (
        <p className="newsletter-msg newsletter-success" role="status">
          Verifique seu e-mail para confirmar sua inscrição. Se o endereço informado estiver apto para inscrição, você receberá um e-mail de confirmação.
        </p>
      )}
    </form>
  );
}

export default NewsletterForm;
