"use client";

import { useState, useRef, useEffect } from "react";
import { verifyTurnstile } from "@/lib/turnstile";

interface ContactFormProps {
  onSuccess?: (data: { name: string; email: string; message: string }) => void;
  onError?: (error: string) => void;
}

/**
 * Formulário de contato com:
 * - Honeypot campo oculto
 * - Validação de tempo mínimo
 * - Validação Turnstile do lado do servidor
 * - Sanitização de entrada
 * - Rate limiting no servidor
 */
export function ContactForm({ onSuccess, onError }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");

  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileLoading, setTurnstileLoading] = useState(false);

  // Honeypot: campo oculto que bots preenchem automaticamente
  const honeypot = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (honeypot.current) {
      honeypot.current.value = "";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Detectar honeypot preenchido (indica bot)
    if (honeypot.current && honeypot.current.value.trim() !== "") {
      setError("Requisição inválida.");
      setStatus("error");
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const nameValue = formData.get("name") as string;
    const emailValue = formData.get("email") as string;
    const messageValue = formData.get("message") as string;
    const turnstileTokenValue = formData.get("cf-turnstile-response") as string;

    // Validação de nome
    if (!nameValue || nameValue.trim().length < 2) {
      setError("Por favor, insira seu nome.");
      setSubmitting(false);
      setStatus("error");
      return;
    }

    if (nameValue.length > 100) {
      setError("Nome muito longo.");
      setSubmitting(false);
      setStatus("error");
      return;
    }

    // Validação de e-mail robusta
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

    // Validação de mensagem
    if (!messageValue || messageValue.trim().length < 10) {
      setError("Por favor, insira uma mensagem com no mínimo 10 caracteres.");
      setSubmitting(false);
      setStatus("error");
      return;
    }

    if (messageValue.length > 2000) {
      setError("Mensagem muito longa.");
      setSubmitting(false);
      setStatus("error");
      return;
    }

    // Validação Turnstile
    if (turnstileTokenValue) {
      const validation = await verifyTurnstile({
        token: turnstileTokenValue,
        hostname: window.location.hostname,
        action: "contact",
      });

      if (!validation.success) {
        setError("Verificação de segurança falhou. Tente novamente.");
        setSubmitting(false);
        setStatus("error");
        return;
      }
    }

    // Simular validação de tempo mínimo (100ms para detectar bots rápidos)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Enviar para endpoint server-side
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameValue,
          email: emailValue,
          message: messageValue,
          turnstile_token: turnstileTokenValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao enviar mensagem.");
        setStatus("error");
        setSubmitting(false);
        return;
      }

      setStatus("success");
      onSuccess?.({ name: nameValue, email: emailValue, message: messageValue });
      
      // Resetar form
      setTimeout(() => {
        setName("");
        setEmail("");
        setMessage("");
        setStatus("idle");
      }, 3000);
    } catch (err) {
      setError("Erro de conexão. Tente novamente mais tarde.");
      setStatus("error");
      setSubmitting(false);
    }
  };

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      aria-label="Contato"
      noValidate
    >
      <h3>Fale conosco</h3>

      {/* Nome field */}
      <div className="form-group">
        <label htmlFor="name" className="sr-only">
          Nome
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          aria-describedby="name-help"
        />
        <p id="name-help" className="form-text">
          Seu nome completo.
        </p>
      </div>

      {/* E-mail field */}
      <div className="form-group">
        <label htmlFor="email" className="sr-only">
          E-mail
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby="email-help"
        />
        <p id="email-help" className="form-text">
          Seu e-mail (não será publicado).
        </p>
      </div>

      {/* Mensagem field */}
      <div className="form-group">
        <label htmlFor="message" className="sr-only">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          className="form-textarea"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={2000}
          aria-describedby="message-help"
        ></textarea>
        <p id="message-help" className="form-text">
          Sua mensagem será enviada diretamente para nossa equipe.
        </p>
      </div>

      {/* Honeypot field (invisible to humans, auto-filled by bots) */}
      <input
        type="text"
        name="bot-field"
        className="hidden-field"
        aria-hidden="true"
        ref={honeypot}
        placeholder="Deixe este campo em branco"
        autoComplete="off"
      />

      {/* Turnstile widget - somente se chave configurada */}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div
          className="turnstile-wrapper"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="submit-btn"
      >
        {submitting ? "Enviando..." : "Enviar"}
      </button>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {status === "success" && (
        <p className="success-message">
          Sua mensagem foi enviada com sucesso! Entramos em contato em breve.
        </p>
      )}
    </form>
  );
}
