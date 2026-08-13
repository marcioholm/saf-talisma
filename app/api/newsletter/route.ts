import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

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

    // Rate limiting: newsletter = 3 tentativas por IP/e-mail em 15 minutos
    const forwardedFor = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();
    
    const rateLimit = checkRateLimit("newsletter", ip, email);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Limite de inscrições atingido. Tente novamente em breve." },
        { status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
          },
        }
      );
    }

    // Validar formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Por favor, insira um e-mail válido." },
        { status: 400 }
      );
    }

    // Validar Turnstile (com chave Restrinx, verifica token existe)
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

    // Em produção, verificar se e-mail já está inscrito (pending ou ativo)
    // e criar registro com status pending e token de confirmação criptograficamente seguro
    // com expiração e uso único
    
    // Send confirmation email
    const { associationConfig } = await import("@/lib/association-config");
    const { emailConfig } = await import("@/lib/email-config");
    const { sendEmail } = await import("@/lib/email");
    const { renderEmail } = await import("@/lib/render-email");
    const { NewsletterConfirmEmail } = await import("@/emails/templates");

    const confirmUrl = `${associationConfig.url}/api/newsletter/confirm?token=dummy-token-for-now`;
    const html = renderEmail(NewsletterConfirmEmail({ confirmUrl }));

    await sendEmail({
      to: email,
      subject: `Confirme sua inscrição na newsletter - ${associationConfig.name}`,
      html,
      from: emailConfig.from.default,
    });

    return NextResponse.json({
      status: "pending",
      message: "Inscrição pendente. Um e-mail de confirmação foi enviado.",
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      },
    });
  } catch (error) {
    console.error("Erro no endpoint newsletter-subscribe:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
