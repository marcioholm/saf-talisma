'use client';

import { useState, useEffect } from 'react';
import ResultadoCard from '@/components/ResultadoCard';
import { Resultado } from '@/types';
import { BarChart3, Users, Trophy, Calendar } from 'lucide-react';

export default function TransparenciaPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<string>('');

  useEffect(() => {
    fetchResultados();
  }, [categoria]);

  const fetchResultados = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20',
      });

      if (categoria) {
        params.append('categoria', categoria);
      }

      const response = await fetch(`/api/resultados?${params}`);
      const result = await response.json();

      setResultados(result.data || []);
    } catch (error) {
      console.error('Error fetching resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const stats = {
    totalJogos: resultados.length,
    vitorias: resultados.filter((r) => r.placar_nosso > r.placar_adversario).length,
    derrotas: resultados.filter((r) => r.placar_nosso < r.placar_adversario).length,
    empates: resultados.filter((r) => r.placar_nosso === r.placar_adversario).length,
    golsPositivos: resultados.reduce((sum, r) => sum + r.placar_nosso, 0),
    golsNegat: resultados.reduce((sum, r) => sum + r.placar_adversario, 0),
  };

  const categories = [
    { value: '', label: 'Todas' },
    { value: 'sub-13', label: 'Sub-13' },
    { value: 'sub-15', label: 'Sub-15' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transparência</h1>
          <p className="text-xl text-primary-100">
            Acompanhe os resultados, dados e desempenho da SAF Talismã
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total de Jogos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalJogos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Vitórias</p>
                  <p className="text-2xl font-bold text-green-600">{stats.vitorias}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Derrotas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.derrotas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Empates</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.empates}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gols */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {stats.golsPositivos}
              </div>
              <p className="text-gray-600 font-semibold">Gols Marcados</p>
              <div className="text-sm text-gray-500 mt-2">
                Média: {(stats.golsPositivos / (stats.totalJogos || 1)).toFixed(2)} por jogo
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">
                {stats.golsNegat}
              </div>
              <p className="text-gray-600 font-semibold">Gols Sofridos</p>
              <div className="text-sm text-gray-500 mt-2">
                Média: {(stats.golsNegat / (stats.totalJogos || 1)).toFixed(2)} por jogo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Resultados dos Jogos</h2>

            {/* Filters */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtrar por categoria</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoria(cat.value)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                      categoria === cat.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resultados Grid */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-lg h-24 animate-pulse"
                  />
                ))}
              </div>
            ) : resultados.length > 0 ? (
              <div className="space-y-4">
                {resultados.map((resultado, idx) => (
                  <ResultadoCard key={idx} {...resultado} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">
                  Nenhum resultado encontrado para esta categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Informações Adicionais */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Informações Importantes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Conformidade',
                description:
                  'A SAF Talismã está regularizada junto aos órgãos competentes e segue todas as normas de funcionamento estabelecidas pela legislação brasileira.',
              },
              {
                title: 'Financeiro',
                description:
                  'Mantemos gestão financeira transparente e responsável. Relatórios detalhados estão disponíveis mediante solicitação.',
              },
              {
                title: 'Código de Conduta',
                description:
                  'Todos os nossos associados, atletas e colaboradores seguem um rigoroso código de conduta e ética profissional.',
              },
              {
                title: 'Contato',
                description:
                  'Para dúvidas sobre transparência ou acesso a documentos, entre em contato conosco através do e-mail oficial.',
              },
            ].map((info, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
                <p className="text-gray-600 leading-relaxed">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dúvidas sobre Transparência?</h2>
          <p className="text-gray-600 mb-8">
            Entre em contato conosco através de contato@saftalisma.com.br
          </p>
          <a
            href="mailto:contato@saftalisma.com.br"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Enviar Mensagem
          </a>
        </div>
      </section>
    </div>
  );
}
