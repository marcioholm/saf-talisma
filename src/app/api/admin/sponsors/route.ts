import { NextRequest, NextResponse } from 'next/server';
import { sponsors } from '@/lib/supabase';
import { CreateSponsorDto } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // TODO: Verificar autenticação do admin

    const body = await request.json() as CreateSponsorDto;

    // Validar campos obrigatórios
    if (!body.nome || !body.logo_url) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Criar sponsor
    const newSponsor = await sponsors.create(body);

    return NextResponse.json(newSponsor, { status: 201 });
  } catch (error) {
    console.error('Create sponsor error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar patrocinador' },
      { status: 500 }
    );
  }
}
