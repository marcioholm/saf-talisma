import { NextRequest, NextResponse } from 'next/server';
import { newsletter } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    await newsletter.subscribe(email);

    return NextResponse.json(
      { message: 'Inscrito com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Newsletter error:', error);

    if (error.message.includes('já está inscrito')) {
      return NextResponse.json(
        { error: 'Este email já está inscrito' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar inscrição' },
      { status: 500 }
    );
  }
}
