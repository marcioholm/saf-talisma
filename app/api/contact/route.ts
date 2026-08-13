import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail, escapeHtml } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type ContactPayload = {
  nome: string;
  email: string;
  mensagem: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as ContactPayload;
    const nome = (body.nome ?? "").trim();
    const email = (body.email ?? "").trim();
    const mensagem = (body.mensagem ?? "").trim();

    // Rate limiting: contact = 5 tentativas por IP em 15 minutos
    const forwardedFor = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    const rateLimit = checkRateLimit("contact", ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em breve." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000)),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": rateLimit.resetTime.toISOString(),
          },
        }
      );
    }

    // Validar nome
    if (!nome || nome.length < 2) {
      return NextResponse.json(
        { error: "Por favor, insira seu nome." },
        { status: 400 }
      );
    }

    if (nome.length > 100) {
      return NextResponse.json(
        { error: "Nome muito longo." },
        { status: 400 }
      );
    }

    // Validar e-mail robusto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Por favor, insira um e-mail válido." },
        { status: 400 }
      );
    }

    if (email.length > 254) {
      return NextResponse.json(
        { error: "E-mail muito longo." },
        { status: 400 }
      );
    }

    // Validar mensagem
    if (!mensagem || mensagem.trim().length < 10) {
      return NextResponse.json(
        { error: "Por favor, insira uma mensagem com no mínimo 10 caracteres." },
        { status: 400 }
      );
    }

    if (mensagem.length > 2000) {
      return NextResponse.json(
        { error: "Mensagem muito longa." },
        { status: 400 }
      );
    }

    // Validar Turnstile (se token fornecido)
    const turnstileToken = req.headers.get("x-turnstile-token");
    if (turnstileToken) {
      const validation = await verifyTurnstile({
        token: turnstileToken,
        hostname: new URL(req.url).hostname,
        action: "contact",
      });

      if (!validation.success) {
        return NextResponse.json(
          { error: "Verificação de segurança falhou." },
          { status: 400 }
        );
      }
    }

    const admin = getSupabaseAdmin();
    
    // Buscar configurações de e-mail
    const { data: settings } = await admin
      .from("site_settings")
      .select("valor")
      .eq("chave", "contatos")
      .maybeSingle();
    
    const contatos =
      settings?.valor && typeof settings.valor === "object"
        ? (settings.valor as { email?: string })
        : {};
    
    // Import configuration here or at the top of the file
    // Assumes associationConfig and emailConfig are properly imported in lib/email or here.
    const { associationConfig } = await import("@/lib/association-config");
    const { emailConfig: emailConfigImport } = await import("@/lib/email-config");

    const to = contatos.email || `contato@${associationConfig.domain}`;
    const from = emailConfigImport.from.contact;

    const { renderEmail } = await import("@/lib/render-email");
    const { ContactFormAdminEmail, ContactFormUserEmail } = await import("@/emails/templates");

    // Email to Admin
    const adminHtml = renderEmail(ContactFormAdminEmail({ userName: nome, email, message: mensagem }));
    
    // Email to User
    const userHtml = renderEmail(ContactFormUserEmail({ userName: nome, message: mensagem }));

    // Send to Admin
    await sendEmail({
      to,
      replyTo: email,
      subject: `Novo contato: ${nome}`,
      html: adminHtml,
      from,
    });

    // Send confirmation to User
    await sendEmail({
      to: email,
      subject: `Recebemos sua mensagem - ${associationConfig.name}`,
      html: userHtml,
      from,
    });

    // Incrementar contador após sucesso (para fins de auditoria)
    // O rate limit já foi verificado no início

    return NextResponse.json({ ok: true }, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": rateLimit.resetTime.toISOString(),
        "Retry-After": "0",
      },
    });

  } catch (err) {
    console.error("Erro no endpoint contact:", err);
    return NextResponse.json(
      { error: "Erro ao processar mensagem." },
      { status: 500 }
    );
  }
}
