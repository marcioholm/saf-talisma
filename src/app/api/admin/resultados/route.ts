import { NextRequest, NextResponse } from 'next/server';
import { resultados } from '@/lib/supabase';
import { CreateResultadoDto } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // TODO: Verificar autenticação do admin

    const body = await request.json() as CreateResultadoDto;

    // Validar campos obrigatórios
    if (!body.competicao || !body.time_adversario || body.placar_saf === undefined || body.placar_adversario === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Criar resultado
    const newResultado = await resultados.create(body);

    return NextResponse.json(newResultado, { status: 201 });
  } catch (error) {
    console.error('Create resultado error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar resultado' },
      { status: 500 }
    );
  }
}
