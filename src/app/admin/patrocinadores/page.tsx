'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sponsor } from '@/types';
import { Plus, Edit, Trash2, Star } from 'lucide-react';

export default function AdminPatrocinadoresPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sponsors');
      const result = await response.json();
      setSponsors(result.data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSponso = async (id: string) => {
    if (!confirm('Tem certeza que quer deletar este patrocinador?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/sponsors/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSponsors(sponsors.filter((s) => s.id !== id));
      } else {
        alert('Erro ao deletar patrocinador');
      }
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      alert('Erro ao deletar patrocinador');
    } finally {
      setDeleting(null);
    }
  };

  const categoryLabels: Record<string, string> = {
    'ouro': '🥇 Ouro',
    'prata': '🥈 Prata',
    'bronze': '🥉 Bronze',
    'parceiro': '🤝 Parceiro',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patrocinadores</h1>
          <p className="text-gray-600 mt-1">Gerenciar logos e informações</p>
        </div>
        <Link href="/admin/patrocinadores/new">
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            Novo Patrocinador
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando patrocinadores...
          </div>
        ) : sponsors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">Nenhum patrocinador adicionado ainda</p>
            <Link href="/admin/patrocinadores/new">
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Adicionar primeiro patrocinador →
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Categoria
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
                {sponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{sponsor.nome}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {categoryLabels[sponsor.categoria] || sponsor.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sponsor.destaque && (
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/patrocinadores/${sponsor.id}/edit`}>
                        <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteSponso(sponsor.id)}
                        disabled={deleting === sponsor.id}
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
      {!loading && sponsors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{sponsors.length}</p>
          </div>
          {['ouro', 'prata', 'bronze'].map((cat) => (
            <div key={cat} className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 capitalize">{categoryLabels[cat]}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {sponsors.filter((s) => s.categoria === cat).length}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
