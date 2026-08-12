import { NextRequest, NextResponse } from 'next/server';
import { sponsors } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Verificar autenticação do admin

    await sponsors.delete(params.id);

    return NextResponse.json(
      { message: 'Patrocinador deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete sponsor error:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar patrocinador' },
      { status: 500 }
    );
  }
}
