import { NextResponse } from "next/server";
import { sendEmail, escapeHtml } from "../../../lib/email";
import { getSupabaseAdmin } from "../../../lib/supabase";

export const runtime = "nodejs";

type ContactPayload = {
  nome?: string;
  empresa?: string;
  telefone?: string;
  email?: string;
  mensagem?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as ContactPayload;
    const nome = (body.nome ?? "").trim();
    const email = (body.email ?? "").trim();
    const mensagem = (body.mensagem ?? "").trim();
    const empresa = (body.empresa ?? "").trim();
    const telefone = (body.telefone ?? "").trim();

    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { error: "Nome, e-mail e mensagem são obrigatórios." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: settings } = await admin
      .from("site_settings")
      .select("valor")
      .eq("chave", "contatos")
      .maybeSingle();
    const contatos =
      settings?.valor && typeof settings.valor === "object"
        ? (settings.valor as { email?: string })
        : {};
    const to = contatos.email || process.env.CONTACT_TO || "contato@saftalisma.com.br";

    const { data: emailConfigRow } = await admin
      .from("site_settings")
      .select("valor")
      .eq("chave", "email_config")
      .maybeSingle();
    const emailConfig =
      emailConfigRow?.valor && typeof emailConfigRow.valor === "object"
        ? (emailConfigRow.valor as { from?: string })
        : {};
    const from = emailConfig.from || process.env.EMAIL_FROM || undefined;

    const lines = [
      ["Nome", nome],
      ["Empresa", empresa],
      ["Telefone", telefone],
      ["E-mail", email],
    ]
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:700">${k}</td><td style="padding:6px 12px;border:1px solid #ddd">${escapeHtml(v)}</td></tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0a6b3d">Novo contato — SAF Talismã</h2>
        <p>Uma nova mensagem foi enviada pelo site:</p>
        <table style="border-collapse:collapse;width:100%">${lines}</table>
        <p style="margin-top:16px"><strong>Mensagem:</strong></p>
        <p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:6px">${escapeHtml(mensagem)}</p>
      </div>`;

    await sendEmail({
      to,
      replyTo: email,
      subject: `Novo contato: ${nome}${empresa ? ` — ${empresa}` : ""}`,
      html,
      ...(from ? { from } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao enviar mensagem." },
      { status: 500 },
    );
  }
}
