'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminNoticiasPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts?limit=100');
      const result = await response.json();
      setPosts(result.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Tem certeza que quer deletar esta notícia?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        alert('Erro ao deletar notícia');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Erro ao deletar notícia');
    } finally {
      setDeleting(null);
    }
  };

  const categoryLabels: Record<string, string> = {
    'noticias': 'Notícias',
    'sub-13': 'Sub-13',
    'sub-15': 'Sub-15',
    'masculino': 'Masculino',
    'evento': 'Evento',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notícias</h1>
          <p className="text-gray-600 mt-1">Gerenciar posts e artigos do site</p>
        </div>
        <Link href="/admin/noticias/new">
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            Nova Notícia
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando notícias...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">Nenhuma notícia criada ainda</p>
            <Link href="/admin/noticias/new">
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Criar primeira notícia →
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Publicado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Destaque
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {post.titulo}
                        </p>
                        <p className="text-sm text-gray-500">{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {categoryLabels[post.categoria] || post.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(
                        new Date(post.data_publicacao),
                        'dd MMM yyyy',
                        { locale: ptBR }
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {post.destaque ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/noticias/${post.id}/edit`}>
                        <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => deletePost(post.id)}
                        disabled={deleting === post.id}
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total de Notícias</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{posts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Destaques</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {posts.filter((p) => p.destaque).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Última Publicação</p>
            <p className="text-sm font-medium text-gray-900 mt-2">
              {posts.length > 0
                ? format(
                    new Date(
                      posts.sort(
                        (a, b) =>
                          new Date(b.data_publicacao).getTime() -
                          new Date(a.data_publicacao).getTime()
                      )[0].data_publicacao
                    ),
                    'dd MMM yyyy',
                    { locale: ptBR }
                  )
                : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
