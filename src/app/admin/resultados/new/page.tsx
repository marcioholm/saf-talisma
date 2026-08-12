'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = [
  { value: 'sub-13', label: 'Sub-13' },
  { value: 'sub-15', label: 'Sub-15' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
];

const RESULTS = [
  { value: 'vitoria', label: '✅ Vitória' },
  { value: 'derrota', label: '❌ Derrota' },
  { value: 'empate', label: '⚪ Empate' },
];

export default function NewResultadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    data_jogo: new Date().toISOString().split('T')[0],
    competicao: '',
    categoria: 'masculino',
    time_adversario: '',
    placar_saf: '',
    placar_adversario: '',
    resultado: '',
    local: '',
    observacoes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate resultado based on placar
    if ((name === 'placar_saf' || name === 'placar_adversario') && formData.placar_saf && formData.placar_adversario) {
      const saf = parseInt(name === 'placar_saf' ? value : formData.placar_saf);
      const adversario = parseInt(name === 'placar_adversario' ? value : formData.placar_adversario);
      
      let resultado = '';
      if (saf > adversario) resultado = 'vitoria';
      else if (saf < adversario) resultado = 'derrota';
      else resultado = 'empate';

      setFormData((prev) => ({ ...prev, resultado }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.competicao || !formData.time_adversario || !formData.placar_saf || !formData.placar_adversario || !formData.resultado) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/resultados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: uuidv4(),
          placar_saf: parseInt(formData.placar_saf),
          placar_adversario: parseInt(formData.placar_adversario),
          data_jogo: new Date(formData.data_jogo).toISOString(),
        }),
      });

      if (response.ok) {
        router.push('/admin/resultados');
      } else {
        const result = await response.json();
        setError(result.error || 'Erro ao criar resultado');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Erro ao criar resultado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/resultados">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Resultado</h1>
          <p className="text-gray-600 mt-1">Registrar resultado de um jogo</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Data do Jogo *
                </label>
                <input
                  type="date"
                  name="data_jogo"
                  value={formData.data_jogo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Competição */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Competição *
                </label>
                <input
                  type="text"
                  name="competicao"
                  value={formData.competicao}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ex: Liga Norte Pioneira, Estadual, etc"
                  required
                />
              </div>

              {/* Time Adversário */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Adversário *
                </label>
                <input
                  type="text"
                  name="time_adversario"
                  value={formData.time_adversario}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nome do time adversário"
                  required
                />
              </div>

              {/* Placar - SAF */}
              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Placar SAF *
                  </label>
                  <input
                    type="number"
                    name="placar_saf"
                    value={formData.placar_saf}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>

                <div className="text-center pb-2">
                  <p className="text-2xl font-bold text-gray-600">×</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Placar Adversário *
                  </label>
                  <input
                    type="number"
                    name="placar_adversario"
                    value={formData.placar_adversario}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Local */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Local
                </label>
                <input
                  type="text"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ginásio, quadra, etc"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Notas adicionais sobre o jogo"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categoria */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Categoria
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Resultado */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Resultado *
              </label>
              <select
                name="resultado"
                value={formData.resultado}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {RESULTS.map((res) => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Preenchido automaticamente pelo placar
              </p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Resultado'}
              </button>
              <Link href="/admin/resultados" className="w-full block">
                <button
                  type="button"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
