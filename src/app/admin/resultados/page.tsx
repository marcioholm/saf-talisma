'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resultado } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminResultadosPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchResultados();
  }, []);

  const fetchResultados = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resultados?limit=100');
      const result = await response.json();
      setResultados(result.data || []);
    } catch (error) {
      console.error('Error fetching resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteResultado = async (id: string) => {
    if (!confirm('Tem certeza que quer deletar este resultado?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/resultados/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setResultados(resultados.filter((r) => r.id !== id));
      } else {
        alert('Erro ao deletar resultado');
      }
    } catch (error) {
      console.error('Error deleting resultado:', error);
      alert('Erro ao deletar resultado');
    } finally {
      setDeleting(null);
    }
  };

  const categoryLabels: Record<string, string> = {
    'sub-13': 'Sub-13',
    'sub-15': 'Sub-15',
    'masculino': 'Masculino',
    'feminino': 'Feminino',
  };

  const getResultColor = (resultado: string) => {
    if (resultado === 'vitoria') return 'bg-green-100 text-green-800';
    if (resultado === 'derrota') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resultados</h1>
          <p className="text-gray-600 mt-1">Gerenciar jogos e placar</p>
        </div>
        <Link href="/admin/resultados/new">
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            Novo Resultado
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando resultados...
          </div>
        ) : resultados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">Nenhum resultado registrado ainda</p>
            <Link href="/admin/resultados/new">
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Registrar primeiro resultado →
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Competição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Placar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Resultado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {resultados.map((resultado) => (
                  <tr key={resultado.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      {format(
                        new Date(resultado.data_jogo),
                        'dd MMM yyyy',
                        { locale: ptBR }
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {resultado.competicao}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {categoryLabels[resultado.categoria] || resultado.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {resultado.placar_saf} × {resultado.placar_adversario}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${getResultColor(
                          resultado.resultado
                        )}`}
                      >
                        {resultado.resultado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/resultados/${resultado.id}/edit`}>
                        <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteResultado(resultado.id)}
                        disabled={deleting === resultado.id}
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
      {!loading && resultados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total de Jogos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {resultados.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <p className="text-sm text-green-600 font-medium">Vitórias</p>
            <p className="text-3xl font-bold text-green-900 mt-2">
              {resultados.filter((r) => r.resultado === 'vitoria').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <p className="text-sm text-red-600 font-medium">Derrotas</p>
            <p className="text-3xl font-bold text-red-900 mt-2">
              {resultados.filter((r) => r.resultado === 'derrota').length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <p className="text-sm text-yellow-600 font-medium">Empates</p>
            <p className="text-3xl font-bold text-yellow-900 mt-2">
              {resultados.filter((r) => r.resultado === 'empate').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
