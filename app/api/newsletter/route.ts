import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { getAdminClient } from "@/lib/admin-client";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email: string;
      turnstile_token?: string;
    };
    const { email, turnstile_token } = body;

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validar formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Por favor, insira um e-mail válido." },
        { status: 400 }
      );
    }

    // Rate limiting: newsletter = 5 tentativas por IP/e-mail em 15 minutos
    const forwardedFor = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();
    
    const rateLimit = checkRateLimit("newsletter", ip, cleanEmail);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Limite de inscrições atingido. Tente novamente em alguns minutos." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
          },
        }
      );
    }

    // Validar Turnstile se configurado
    if (turnstile_token) {
      const validation = await verifyTurnstile({
        token: turnstile_token,
        hostname: new URL(request.url).hostname,
        action: "newsletter",
      });

      if (!validation.success) {
        return NextResponse.json(
          { error: "Verificação de segurança falhou." },
          { status: 400 }
        );
      }
    }

    // Salvar inscrição no banco Supabase
    try {
      const client = getAdminClient();
      await client.from("newsletter_subscribers").upsert(
        {
          email: cleanEmail,
          status: "active",
          confirmed_at: new Date().toISOString(),
          ip_address: ip,
        },
        { onConflict: "email" }
      );
    } catch (dbErr) {
      console.warn("Aviso ao salvar newsletter_subscribers:", dbErr);
    }

    // Tentativa de envio de e-mail de boas-vindas/confirmação
    try {
      const { associationConfig } = await import("@/lib/association-config");
      const { emailConfig } = await import("@/lib/email-config");
      const { sendEmail } = await import("@/lib/email");
      const { renderEmail } = await import("@/lib/render-email");
      const { NewsletterConfirmEmail } = await import("@/emails/templates");

      const confirmUrl = `${associationConfig.url}`;
      const html = await renderEmail(NewsletterConfirmEmail({ confirmUrl }));

      await sendEmail({
        to: cleanEmail,
        subject: `Bem-vindo às novidades da ${associationConfig.name}!`,
        html,
        from: emailConfig.from.default,
      });
    } catch (emailErr) {
      console.warn("Aviso ao enviar e-mail da newsletter (inscrição foi registrada com sucesso):", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Inscrição realizada com sucesso! Você receberá as novidades da Associação.",
    });
  } catch (error) {
    console.error("Erro no endpoint newsletter:", error);
    return NextResponse.json(
      { error: "Erro ao processar sua inscrição. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
