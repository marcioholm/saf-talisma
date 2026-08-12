'use client';

import { useEffect, useState } from 'react';
import { NewsletterSubscriber } from '@/types';
import { Mail, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      // Nota: Você pode precisar criar uma API específica para isso
      // Por enquanto, vamos usar um placeholder
      setSubscribers([]);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Tem certeza que quer remover este inscrito?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSubscribers(subscribers.filter((s) => s.id !== id));
      } else {
        alert('Erro ao remover inscrito');
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Erro ao remover inscrito');
    } finally {
      setDeleting(null);
    }
  };

  const exportAsCSV = () => {
    const csv = subscribers.map((s) => `${s.email}`).join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', 'newsletter-inscritos.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600 mt-1">Gerenciar inscritos e envios</p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={exportAsCSV}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Inscritos</p>
              <p className="text-3xl font-bold text-gray-900">{subscribers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Taxa de Inscrição</p>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-500 mt-1">Calcular em breve</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Último Inscrito</p>
          <p className="text-sm font-medium text-gray-900 mt-2">
            {subscribers.length > 0
              ? format(
                  new Date(
                    subscribers.sort(
                      (a, b) =>
                        new Date(b.data_inscricao).getTime() -
                        new Date(a.data_inscricao).getTime()
                    )[0].data_inscricao
                  ),
                  'dd MMM yyyy',
                  { locale: ptBR }
                )
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando inscritos...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">Nenhum inscrito na newsletter ainda</p>
            <p className="text-sm">
              Os inscritos aparecerão aqui quando alguém se inscrever no site
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Data de Inscrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(
                        new Date(subscriber.data_inscricao),
                        'dd MMM yyyy',
                        { locale: ptBR }
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteSubscriber(subscriber.id)}
                        disabled={deleting === subscriber.id}
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

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Próxima Etapa</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          Integração com Resend para enviar emails automáticos para inscritos quando há novas notícias. 
          Esta funcionalidade será implementada no Sprint 2 completo.
        </p>
      </div>
    </div>
  );
}
