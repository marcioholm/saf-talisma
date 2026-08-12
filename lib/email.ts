if (typeof window !== "undefined") {
  throw new Error("lib/email.ts só pode ser usado no servidor.");
}

const RESEND_URL = "https://api.resend.com/emails";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export function emailFrom(): string {
  return process.env.EMAIL_FROM || "onboarding@resend.dev";
}

async function resend(path: string, body: unknown): Promise<{ id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não definida no servidor.");
  }
  const res = await fetch(`${RESEND_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(json.message || `Resend HTTP ${res.status}`);
  }
  return json;
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  await resend("", { from: emailFrom(), ...msg });
}

export async function sendBatchEmails(messages: EmailMessage[]): Promise<void> {
  if (!messages.length) return;
  const from = emailFrom();
  await resend("/batch", messages.map((m) => ({ from, ...m })));
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
