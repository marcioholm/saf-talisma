import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email";
import { emailConfig } from "@/lib/email-config";
import { associationConfig } from "@/lib/association-config";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zompnocfdlofhsyuiuhj.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdmin() {
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      championship_slug,
      team,
      responsible,
      staff,
      athletes,
      rules_accepted,
      privacy_accepted,
      future_campaigns_accepted,
      turnstile_token,
      bot_field,
    } = body;

    // Honeypot check
    if (bot_field && String(bot_field).trim() !== "") {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }

    // Rate limit check
    const forwardedFor = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();
    const rateLimit = checkRateLimit("contact", ip, responsible?.email || "anon");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Limite de tentativas atingido. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    // Turnstile check
    if (turnstile_token) {
      const validation = await verifyTurnstile({
        token: turnstile_token,
        hostname: new URL(request.url).hostname,
        action: "registration",
      });
      if (!validation.success) {
        return NextResponse.json({ error: "Verificação de segurança falhou." }, { status: 400 });
      }
    }

    if (!championship_slug || !team?.team_name || !responsible?.email || !responsible?.full_name) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const admin = getAdmin();

    // 1. Verificar campeonato
    const { data: champ, error: champError } = await admin
      .from("championships")
      .select("*")
      .eq("slug", championship_slug)
      .single();

    if (champError || !champ || champ.visibility === "draft" || champ.visibility === "archived") {
      return NextResponse.json({ error: "Campeonato não encontrado ou indisponível." }, { status: 404 });
    }

    if (champ.registration_status !== "open") {
      return NextResponse.json({ error: "As inscrições para este campeonato não estão abertas." }, { status: 400 });
    }

    // Check max teams
    const { count } = await admin
      .from("team_registrations")
      .select("id", { count: "exact", head: true })
      .eq("championship_id", champ.id)
      .neq("status", "cancelled");

    if (count !== null && count >= champ.max_teams) {
      return NextResponse.json({ error: "Limite de vagas preenchido para este campeonato." }, { status: 400 });
    }

    // Validate athlete count
    const athleteList = Array.isArray(athletes) ? athletes : [];
    if (athleteList.length < (champ.min_athletes_per_team || 5)) {
      return NextResponse.json(
        { error: `Número de atletas inferior ao mínimo de ${champ.min_athletes_per_team} exigidos.` },
        { status: 400 }
      );
    }
    if (athleteList.length > (champ.max_athletes_per_team || 15)) {
      return NextResponse.json(
        { error: `Número de atletas excede o limite máximo de ${champ.max_athletes_per_team}.` },
        { status: 400 }
      );
    }

    // Generate Protocol & Access Token
    const randHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    const protocol = `SAF-${new Date().getFullYear()}-${randHex}`;
    const accessToken = crypto.randomBytes(16).toString("hex");

    // 2. Insert Responsible Contact
    const { data: respData, error: respErr } = await admin
      .from("team_responsible_contacts")
      .insert([
        {
          full_name: responsible.full_name,
          role: responsible.role || "Representante",
          email: responsible.email,
          phone: responsible.phone || "",
          city: responsible.city || team.city,
          state: responsible.state || "PR",
          email_verified: false,
          representation_declared: true,
        },
      ])
      .select("id")
      .single();

    if (respErr || !respData) {
      throw new Error(`Erro ao salvar responsável: ${respErr?.message}`);
    }

    // 3. Insert Team Registration
    const { data: regData, error: regErr } = await admin
      .from("team_registrations")
      .insert([
        {
          championship_id: champ.id,
          responsible_id: respData.id,
          team_name: team.team_name,
          short_name: team.short_name || team.team_name.slice(0, 10),
          city: team.city || "Arapoti",
          state: team.state || "PR",
          colors: team.colors || "",
          notes: team.notes || "",
          protocol,
          access_token: accessToken,
          status: "pending",
        },
      ])
      .select("id")
      .single();

    if (regErr || !regData) {
      throw new Error(`Erro ao salvar equipe: ${regErr?.message}`);
    }

    // 4. Insert Staff
    const staffList = Array.isArray(staff) ? staff : [];
    if (staffList.length > 0) {
      await admin.from("team_staff").insert(
        staffList.map((s: any) => ({
          registration_id: regData.id,
          full_name: s.full_name,
          role: s.role || "Membro",
        }))
      );
    }

    // 5. Insert Athletes
    if (athleteList.length > 0) {
      await admin.from("registration_athletes").insert(
        athleteList.map((a: any, idx: number) => ({
          registration_id: regData.id,
          full_name: a.full_name,
          sports_name: a.sports_name || a.full_name.split(" ")[0],
          birth_date: a.birth_date || "2000-01-01",
          city: a.city || team.city,
          state: a.state || "PR",
          jersey_number: a.jersey_number || idx + 1,
          position: a.position || "Atleta",
          parent_guardian_name: a.parent_guardian_name || null,
          parent_guardian_phone: a.parent_guardian_phone || null,
        }))
      );
    }

    // 6. Insert Consents
    await admin.from("registration_consents").insert([
      {
        registration_id: regData.id,
        rules_accepted: Boolean(rules_accepted),
        privacy_accepted: Boolean(privacy_accepted),
      },
    ]);

    await admin.from("communication_consents").insert([
      {
        responsible_id: respData.id,
        future_campaigns_accepted: Boolean(future_campaigns_accepted),
      },
    ]);

    // 7. Send Emails
    const trackingUrl = `${associationConfig.url}/inscricoes/equipe/${accessToken}`;

    // Email to Responsible
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2 style="color: #61CE70; background: #0d0d0d; padding: 20px; text-align: center; margin: 0;">
          Associação Esportiva SAF/Talismã
        </h2>
        <div style="padding: 24px; border: 1px solid #eee;">
          <h3>Inscrição Recebida com Sucesso!</h3>
          <p>Olá, <strong>${responsible.full_name}</strong>.</p>
          <p>A inscrição da equipe <strong>${team.team_name}</strong> para o campeonato <strong>${champ.name}</strong> foi registrada e está sob análise inicial.</p>
          
          <div style="background: #fafafa; border-left: 4px solid #D200D2; padding: 16px; margin: 20px 0;">
            <strong>Protocolo de Inscrição:</strong> <code style="font-size: 16px;">${protocol}</code><br/>
            <strong>Equipe:</strong> ${team.team_name} (${team.city} - ${team.state})<br/>
            <strong>Atletas Inscritos:</strong> ${athleteList.length}
          </div>

          <p>Você pode acompanhar o status da sua inscrição ou enviar correções acessando o link exclusivo abaixo:</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${trackingUrl}" style="background: #D200D2; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Acompanhar Inscrição
            </a>
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: responsible.email,
      subject: `Inscrição Recebida: ${team.team_name} - Protocolo ${protocol}`,
      html: userEmailHtml,
      from: emailConfig.automatic.from,
      replyTo: emailConfig.automatic.replyTo,
    });

    // Email to Internal Operations (saftalisma1@gmail.com)
    const internalEmail = emailConfig.internalNotificationEmail;
    const internalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h3>🚨 Nova Inscrição de Equipe Recebida</h3>
        <p><strong>Campeonato:</strong> ${champ.name}</p>
        <p><strong>Equipe:</strong> ${team.team_name} (${team.city} - ${team.state})</p>
        <p><strong>Responsável:</strong> ${responsible.full_name} (${responsible.email} | ${responsible.phone})</p>
        <p><strong>Atletas:</strong> ${athleteList.length} cadastrados</p>
        <p><strong>Protocolo:</strong> ${protocol}</p>
        <p><a href="${associationConfig.url}/admin/campeonatos/${champ.id}/inscricoes">Acessar Painel de Inscrições</a></p>
      </div>
    `;

    await sendEmail({
      to: internalEmail,
      subject: `[Nova Inscrição] ${team.team_name} - ${champ.name}`,
      html: internalHtml,
      from: emailConfig.automatic.from,
    });

    return NextResponse.json({
      success: true,
      protocol,
      access_token: accessToken,
      tracking_url: trackingUrl,
    });
  } catch (error) {
    console.error("Erro ao registrar inscrição de equipe:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno ao processar inscrição." },
      { status: 500 }
    );
  }
}
