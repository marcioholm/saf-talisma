'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/components/NewsCard';
import { Post } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'noticias', label: 'Notícias' },
  { value: 'sub-13', label: 'Sub-13' },
  { value: 'sub-15', label: 'Sub-15' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'evento', label: 'Eventos' },
];

export default function NoticiasPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [page, categoria]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
      });

      if (categoria) {
        params.append('categoria', categoria);
      }

      const response = await fetch(`/api/posts?${params}`);
      const result = await response.json();

      setPosts(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategoria: string) => {
    setCategoria(newCategoria);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Notícias</h1>
          <p className="text-gray-600 text-lg">
            Acompanhe as últimas notícias sobre a SAF Talismã, resultados de jogos e eventos.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtrar por categoria</h3>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  categoria === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-96 animate-pulse"
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <NewsCard key={post.id} {...post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isNear = Math.abs(pageNum - page) <= 2;
                    const isFirst = pageNum === 1;
                    const isLast = pageNum === totalPages;

                    if (!isNear && !isFirst && !isLast) {
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return <span key={i} className="px-2">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white shadow hover:shadow-md'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma notícia encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
