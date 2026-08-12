import { NextRequest, NextResponse } from 'next/server';
import { resultados } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Verificar autenticação do admin

    await resultados.delete(params.id);

    return NextResponse.json(
      { message: 'Resultado deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete resultado error:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar resultado' },
      { status: 500 }
    );
  }
}
