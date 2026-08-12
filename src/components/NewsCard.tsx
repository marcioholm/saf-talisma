import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';

interface NewsCardProps {
  id: string;
  titulo: string;
  slug: string;
  resumo?: string;
  conteudo: string;
  categoria: string;
  imagem_url?: string;
  autor: string;
  data_publicacao: string;
}

const categoryColors: Record<string, string> = {
  'noticias': 'bg-blue-100 text-blue-800',
  'sub-13': 'bg-green-100 text-green-800',
  'sub-15': 'bg-purple-100 text-purple-800',
  'masculino': 'bg-red-100 text-red-800',
  'evento': 'bg-yellow-100 text-yellow-800',
};

const categoryLabels: Record<string, string> = {
  'noticias': 'Notícias',
  'sub-13': 'Sub-13',
  'sub-15': 'Sub-15',
  'masculino': 'Masculino',
  'evento': 'Evento',
};

export default function NewsCard({ 
  slug, 
  titulo, 
  resumo, 
  conteudo, 
  categoria, 
  imagem_url, 
  autor, 
  data_publicacao 
}: NewsCardProps) {
  const excerpt = resumo || conteudo.slice(0, 150).replace(/<[^>]*>/g, '') + '...';
  const publishedAt = new Date(data_publicacao);
  const timeAgo = formatDistanceToNow(publishedAt, { locale: ptBR, addSuffix: true });

  return (
    <article className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden animate-fade-in">
      {/* Image */}
      {imagem_url && (
        <div className="overflow-hidden bg-gray-200 h-48">
          <img
            src={imagem_url}
            alt={titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              categoryColors[categoria] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {categoryLabels[categoria] || categoria}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {titulo}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 border-t pt-3">
          <span>{autor}</span>
          <span>{timeAgo}</span>
        </div>

        {/* Read More Link */}
        <Link
          href={`/noticias/${slug}`}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold group/link"
        >
          Leia mais
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
