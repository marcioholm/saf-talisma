import { NextRequest, NextResponse } from 'next/server';
import { resultados } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoria = searchParams.get('categoria');
    const recent = searchParams.get('recent') === 'true';

    const offset = (page - 1) * limit;

    let data, count;

    if (recent) {
      data = await resultados.getRecent(5);
      count = data?.length || 0;
    } else if (categoria) {
      ({ data, count } = await resultados.getByCategory(categoria, limit, offset));
    } else {
      ({ data, count } = await resultados.getAll(limit, offset));
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Resultados API error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar resultados' },
      { status: 500 }
    );
  }
}
