'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Trophy,
  ChevronRight,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { DashboardStats } from '@/types/admin';

const StatCard = ({
  icon: Icon,
  label,
  value,
  href,
  color = 'blue',
}: {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: number;
  href: string;
  color?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{label}</h3>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Buscar posts
      const postsRes = await fetch('/api/posts?limit=100');
      const postsData = await postsRes.json();

      // Buscar sponsors
      const sponsorsRes = await fetch('/api/sponsors');
      const sponsorsData = await sponsorsRes.json();

      // Buscar resultados
      const resultadosRes = await fetch('/api/resultados?limit=100');
      const resultadosData = await resultadosRes.json();

      setStats({
        totalPosts: postsData.pagination?.total || 0,
        totalSponsors: sponsorsData.data?.length || 0,
        totalResultados: resultadosData.pagination?.total || 0,
        newsSubscribers: 0, // TODO: Implementar endpoint
        recentPosts: (postsData.data || []).slice(0, 5).length,
        recentResultados: (resultadosData.data || []).slice(0, 5).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bem-vindo ao Admin!</h2>
        <p className="text-gray-600 mt-1">Aqui você gerencia todo o conteúdo do site SAF Talismã</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Notícias"
          value={stats?.totalPosts || 0}
          href="/admin/noticias"
          color="blue"
        />
        <StatCard
          icon={Trophy}
          label="Patrocinadores"
          value={stats?.totalSponsors || 0}
          href="/admin/patrocinadores"
          color="purple"
        />
        <StatCard
          icon={Calendar}
          label="Resultados"
          value={stats?.totalResultados || 0}
          href="/admin/resultados"
          color="green"
        />
        <StatCard
          icon={Users}
          label="Inscritos Newsletter"
          value={stats?.newsSubscribers || 0}
          href="/admin/newsletter"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
          </div>
          <div className="space-y-2">
            <Link href="/admin/noticias/new">
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                  Nova Notícia
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
              </button>
            </Link>
            <Link href="/admin/patrocinadores/new">
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                  Novo Patrocinador
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
              </button>
            </Link>
            <Link href="/admin/resultados/new">
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                  Novo Resultado
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
              </button>
            </Link>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">Dica de Uso</h3>
              <p className="text-sm text-primary-700 leading-relaxed">
                Use este painel para gerenciar notícias, patrocinadores e resultados de jogos.
                Todas as alterações são salvas no banco de dados em tempo real.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recursos Disponíveis</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
            Criar, editar e deletar notícias com categorias
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
            Gerenciar patrocinadores por categoria (Ouro, Prata, Bronze, Parceiro)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
            Registrar resultados de jogos com placar e competição
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
            Ver lista de inscritos na newsletter
          </li>
        </ul>
      </div>
    </div>
  );
}
