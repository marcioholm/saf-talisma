import { NextRequest, NextResponse } from 'next/server';
import { sponsors } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoria = searchParams.get('categoria');
    const featured = searchParams.get('featured') === 'true';

    let data;

    if (featured) {
      data = await sponsors.getFeatured();
    } else if (categoria) {
      data = await sponsors.getByCategory(categoria);
    } else {
      data = await sponsors.getAll();
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Sponsors API error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar patrocinadores' },
      { status: 500 }
    );
  }
}
