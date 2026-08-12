import { NextRequest, NextResponse } from 'next/server';
import { posts } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoria = searchParams.get('categoria');
    const featured = searchParams.get('featured') === 'true';

    const offset = (page - 1) * limit;

    let data, count;

    if (featured) {
      data = await posts.getFeatured(3);
      count = Math.min(3, data?.length || 0);
    } else if (categoria) {
      ({ data, count } = await posts.getByCategory(categoria, limit, offset));
    } else {
      ({ data, count } = await posts.getAll(limit, offset));
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
    console.error('Posts API error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar posts' },
      { status: 500 }
    );
  }
}
