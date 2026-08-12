import { NextRequest, NextResponse } from 'next/server';
import { posts } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Verificar autenticação do admin

    await posts.delete(params.id);

    return NextResponse.json(
      { message: 'Post deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar post' },
      { status: 500 }
    );
  }
}
