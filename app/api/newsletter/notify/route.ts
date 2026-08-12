import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Exigir autenticação administrativa no servidor
    // Verificar se o usuário é admin (em produção, usar auth do Supabase)
    const admin = getSupabaseAdmin();
    
    // Em produção, validar token de admin ou sessão
    // Aqui, apenas verificamos se a requisição vem com header de admin
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Autenticação administrativa necessária." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      postId: string;
      dispatchType?: "default" | "urgent";
    };
    const { postId, dispatchType = "default" } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "post_id é obrigatório." },
        { status: 400 }
      );
    }

    // Rate limiting administrativo: verificar limite por IP/admin
    const forwardedFor = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    
    // Para notify: limite administrativo e idempotência por notícia
    const rateLimit = checkRateLimit("notify", ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Limite de disparos administrativos atingido." },
        { status: 429 },
        {
          headers: {
            "Retry-After": String(rateLimit.resetIn),
          },
        }
      );
    }

    // Consultar status do post no banco de dados
    const { data: post, error: postError } = await admin
      .from("posts")
      .select("id, status, titulo")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post não encontrado." },
        { status: 404 }
      );
    }

    // Verificar status do post - apenas posts publicados são disparados
    // Esta verificação NÃO é idempotência (ver item 9 das correções)
    if (post.status !== "published") {
      return NextResponse.json(
        { error: "Apenas posts com status 'published' podem ser disparados." },
        { status: 400 }
      );
    }

    // Criar registro de dispatch com constraint única por post_id e dispatch_type
    // Em produção, usar Supabase com constraint única
    const { error: dispatchError } = await admin
      .from("newsletter_dispatches")
      .insert({
        post_id: postId,
        dispatch_type: dispatchType,
        status: "pending",
        initiated_at: new Date().toISOString(),
        ip,
      });

    if (dispatchError) {
      // Constraint única violada - dispatch já foi processado (idempotência)
      if (dispatchError.code === "23505") {
        return NextResponse.json({
          status: "already_dispatched",
          message: "Este post já foi disparado anteriormente.",
          idempotent: true,
        });
      }
      return NextResponse.json(
        { error: "Erro ao registrar disparo.", details: dispatchError.message },
        { status: 500 }
      );
    }

    // Processar destinatários ativos em lotes
    // Obter inscritos ativos da newsletter
    const { data: subscribers } = await admin
      .from("newsletter_subscribers")
      .select("email")
      .eq("ativo", true)
      .limit(100); // Lote inicial

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        status: "no_subscribers",
        message: "Nenhum inscrito ativo encontrado.",
      });
    }

    // Em produção, processar em lotes maiores e usar SendGrid/Resend
    // Aqui, apenas registrar que o disparo foi iniciado
    
    // Atualizar status do dispatch
    await admin
      .from("newsletter_dispatches")
      .update({
        status: "processing",
        processed_at: new Date().toISOString(),
        recipient_count: subscribers.length,
      })
      .eq("post_id", postId);

    return NextResponse.json({
      status: "started",
      message: "Disparo de newsletter iniciado.",
      postTitle: post.titulo,
      recipientCount: subscribers.length,
      dispatchId: postId,
      idempotent: false,
    });

  } catch (err) {
    console.error("Erro no endpoint newsletter-notify:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
