import { Metadata } from 'next';
import { posts } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const post = await posts.getBySlug(params.slug);

    if (!post) {
      return {
        title: 'Post não encontrado',
        description: 'O post que você procura não foi encontrado.',
      };
    }

    const excerpt = post.resumo || post.conteudo.slice(0, 160).replace(/<[^>]*>/g, '');

    return {
      title: post.titulo,
      description: excerpt,
      openGraph: {
        title: post.titulo,
        description: excerpt,
        type: 'article',
        publishedTime: post.data_publicacao,
        modifiedTime: post.updated_at,
        images: post.imagem_url ? [{ url: post.imagem_url }] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Erro ao carregar post',
      description: 'Houve um erro ao carregar este post.',
    };
  }
}

async function PostContent({ params }: PostPageProps) {
  try {
    const post = await posts.getBySlug(params.slug);

    if (!post) {
      notFound();
    }

    const publishedDate = new Date(post.data_publicacao);
    const publishedFormatted = format(publishedDate, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });

    const categoryLabels: Record<string, string> = {
      'noticias': 'Notícias',
      'sub-13': 'Sub-13',
      'sub-15': 'Sub-15',
      'masculino': 'Masculino',
      'evento': 'Evento',
    };

    return (
      <article className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Notícias
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {categoryLabels[post.categoria] || post.categoria}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.titulo}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-gray-600 border-y py-4">
              <div>
                <p className="font-medium">
                  Por <span className="text-gray-900">{post.autor}</span>
                </p>
                <p className="text-sm text-gray-500">{publishedFormatted}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  Tempo de leitura: ~{Math.ceil(post.conteudo.split(' ').length / 200)} min
                </span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.imagem_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.imagem_url}
                alt={post.titulo}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12 text-gray-700 leading-relaxed">
            {post.conteudo.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx} className="mb-4">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* Share Section */}
          <div className="border-t border-b py-6 mb-8">
            <p className="text-gray-900 font-semibold mb-4">Compartilhe este artigo:</p>
            <div className="flex gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.titulo)}&url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/noticias/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/noticias/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
              >
                Facebook
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${post.titulo}\n\n${process.env.NEXT_PUBLIC_SITE_URL}/noticias/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Quer conhecer mais sobre a SAF Talismã?
            </h3>
            <p className="text-gray-600 mb-6">
              Explore nossas outras notícias, conheça nossos patrocinadores e seja parte desta história.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sobre"
                className="btn btn-primary"
              >
                Sobre Nós
              </Link>
              <Link
                href="/patrocinadores"
                className="btn btn-outline"
              >
                Seja Parceiro
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }
}

export default function PostPage(props: PostPageProps) {
  return <PostContent {...props} />;
}
