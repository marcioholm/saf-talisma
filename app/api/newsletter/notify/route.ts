import { NextResponse } from "next/server";
import { sendBatchEmails, escapeHtml, type EmailMessage } from "../../../../lib/email";
import { getSupabaseAdmin } from "../../../../lib/supabase";

export const runtime = "nodejs";

const MAX_PER_CALL = 100;

export async function POST(req: Request) {
  try {
    const { postId } = (await req.json().catch(() => ({}))) as { postId?: string };
    if (!postId) {
      return NextResponse.json({ error: "postId é obrigatório." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: post, error: postError } = await admin
      .from("posts")
      .select("id, titulo, resumo, slug, status")
      .eq("id", postId)
      .maybeSingle();

    if (postError || !post) {
      return NextResponse.json({ error: "Notícia não encontrada." }, { status: 404 });
    }
    if (post.status !== "published") {
      return NextResponse.json({ ok: true, skipped: "not_published" });
    }

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

    const { data: subscribers } = await admin
      .from("newsletter_subscribers")
      .select("email")
      .eq("ativo", true);

    const emails = [...new Set((subscribers ?? []).map((s) => s.email).filter(Boolean))] as string[];
    if (!emails.length) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saf-talisma.vercel.app";
    const postUrl = `${siteUrl.replace(/\/$/, "")}/noticias/${post.slug}`;
    const resumo = post.resumo || "";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0a6b3d;margin-bottom:4px">SAF Talismã</h2>
        <p style="text-transform:uppercase;letter-spacing:.12em;font-size:12px;color:#888;margin-top:0">Futsal, formação e futuro</p>
        <hr style="border:none;border-top:3px solid #0a6b3d"/>
        <h1 style="font-size:22px;line-height:1.3">${escapeHtml(post.titulo)}</h1>
        ${resumo ? `<p style="color:#444;font-size:15px;line-height:1.5">${escapeHtml(resumo)}</p>` : ""}
        <p style="margin:24px 0">
          <a href="${postUrl}" style="display:inline-block;background:#0a6b3d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:700">Ler notícia completa →</a>
        </p>
        <p style="color:#999;font-size:12px">Você recebeu este e-mail por estar inscrito na newsletter da SAF Talismã.</p>
      </div>`;

    const messages: EmailMessage[] = emails.map((to) => ({
      to,
      subject: `Nova notícia: ${post.titulo}`,
      html,
      ...(from ? { from } : {}),
    }));

    let sent = 0;
    for (let i = 0; i < messages.length; i += MAX_PER_CALL) {
      await sendBatchEmails(messages.slice(i, i + MAX_PER_CALL));
      sent += Math.min(MAX_PER_CALL, messages.length - i);
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao enviar newsletter." },
      { status: 500 },
    );
  }
}
