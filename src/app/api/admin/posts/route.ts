import { NextRequest, NextResponse } from 'next/server';
import { posts } from '@/lib/supabase';
import { CreatePostDto } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // TODO: Verificar autenticação do admin

    const body = await request.json() as CreatePostDto;

    // Validar campos obrigatórios
    if (!body.titulo || !body.conteudo || !body.slug) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Criar post
    const newPost = await posts.create(body);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar post' },
      { status: 500 }
    );
  }
}
