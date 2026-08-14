import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://zompnocfdlofhsyuiuhj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_xfyG0CUyTWHk1JDesbUG8w_FVsOF56o";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.session) {
      const msg =
        error?.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error?.message || "Falha na autenticação.";
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    // Cria resposta com os dados da sessão e define cookie seguro
    const response = NextResponse.json({
      ok: true,
      session: data.session,
      user: data.user,
    });

    response.cookies.set("saf_admin_logged", "true", {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Erro no login admin API:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar login." },
      { status: 500 }
    );
  }
}
