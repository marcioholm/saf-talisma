'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = [
  { value: 'noticias', label: 'Notícias' },
  { value: 'sub-13', label: 'Sub-13' },
  { value: 'sub-15', label: 'Sub-15' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'evento', label: 'Evento' },
];

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    conteudo: '',
    resumo: '',
    categoria: 'noticias',
    imagem_url: '',
    autor: '',
    data_publicacao: new Date().toISOString().split('T')[0],
    destaque: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
      // Auto-generate slug from titulo
      ...(name === 'titulo' && {
        slug: value
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-'),
      }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.titulo || !formData.conteudo) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: uuidv4(),
          data_publicacao: new Date(formData.data_publicacao).toISOString(),
        }),
      });

      if (response.ok) {
        router.push('/admin/noticias');
      } else {
        const result = await response.json();
        setError(result.error || 'Erro ao criar notícia');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Erro ao criar notícia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/noticias">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Notícia</h1>
          <p className="text-gray-600 mt-1">Criar um novo post no site</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Título da notícia"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="url-da-noticia"
                  required
                />
              </div>

              {/* Resumo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Resumo
                </label>
                <textarea
                  name="resumo"
                  value={formData.resumo}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Resumo do post (opcional)"
                />
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Conteúdo *
                </label>
                <textarea
                  name="conteudo"
                  value={formData.conteudo}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                  placeholder="Conteúdo do post (suporta quebras de linha)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
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

            {/* Data */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Data de Publicação
              </label>
              <input
                type="date"
                name="data_publicacao"
                value={formData.data_publicacao}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Autor */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Autor
              </label>
              <input
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nome do autor"
              />
            </div>

            {/* Imagem URL */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                name="imagem_url"
                value={formData.imagem_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            {/* Destaque */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="destaque"
                  checked={formData.destaque}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-900">
                  Marcar como destaque
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Posts em destaque aparecem na home
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
                {loading ? 'Salvando...' : 'Salvar Notícia'}
              </button>
              <Link href="/admin/noticias" className="w-full block">
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
