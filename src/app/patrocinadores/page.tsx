'use client';

import { useState, useEffect } from 'react';
import SponsorGrid from '@/components/SponsorGrid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle } from 'lucide-react';

const ContactSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  empresa: z.string().min(3, 'Empresa deve ter pelo menos 3 caracteres'),
  telefone: z.string().min(10, 'Telefone inválido'),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type ContactFormData = z.infer<typeof ContactSchema>;

interface Sponsor {
  id: string;
  nome: string;
  logo_url: string;
  categoria: string;
  website?: string;
  destaque: boolean;
  ordem: number;
}

export default function PatrocinadoresdPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors');
      const result = await response.json();
      setSponsors(result.data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        reset();
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-accent-600 to-accent-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Patrocinadores</h1>
          <p className="text-xl text-accent-100">
            Conheça nossos parceiros e saiba como integrar sua marca à SAF Talismã
          </p>
        </div>
      </section>

      {/* Sponsors Grid */}
      {!loading && sponsors.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SponsorGrid sponsors={sponsors} />
          </div>
        </section>
      )}

      {/* Partnership Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Por que Patrocinar a SAF Talismã?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '👁️',
                title: 'Visibilidade de Marca',
                description:
                  'Exponha sua marca para milhares de seguidores em nossas redes sociais e eventos.',
              },
              {
                icon: '🤝',
                title: 'Responsabilidade Social',
                description:
                  'Contribua para a formação de jovens talentos e desenvolvimento da comunidade.',
              },
              {
                icon: '📈',
                title: 'ROI Comprovado',
                description:
                  'Relatórios mensais de alcance, engajamento e impacto das ações de marketing.',
              },
              {
                icon: '⚽',
                title: 'Associação com Esporte',
                description:
                  'Vincule sua marca aos valores do esporte: disciplina, respeito e excelência.',
              },
              {
                icon: '🎯',
                title: 'Ações Customizadas',
                description:
                  'Desenvolva campanhas exclusivas e personalizadas conforme objetivos da sua empresa.',
              },
              {
                icon: '🏆',
                title: 'Eventos Especiais',
                description:
                  'Acesso a eventos, torneios e atividades exclusivas da SAF Talismã.',
              },
            ].map((benefit, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Categorias de Parcerias
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: 'Bronze',
                color: 'from-yellow-50 to-yellow-100',
                border: 'border-yellow-300',
                items: ['Logo no site', 'Menção nas redes sociais', 'Certificado'],
              },
              {
                name: 'Prata',
                color: 'from-gray-50 to-gray-100',
                border: 'border-gray-300',
                items: [
                  'Tudo do Bronze',
                  'Ativação em evento',
                  'Relatório mensal',
                  'Ingressos para jogos',
                ],
              },
              {
                name: 'Ouro',
                color: 'from-yellow-50 to-yellow-100',
                border: 'border-yellow-400',
                items: [
                  'Tudo da Prata',
                  'Naming em categoria',
                  'Uniforme/Material',
                  'Entrevistas',
                ],
              },
              {
                name: 'Personalizado',
                color: 'from-blue-50 to-blue-100',
                border: 'border-blue-300',
                items: ['Pacote sob medida', 'Negociação direta', 'Máxima visibilidade', 'ROI otimizado'],
              },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${tier.color} rounded-lg p-6 border-2 ${tier.border}`}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{tier.name}</h3>
                <ul className="space-y-3">
                  {tier.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contato" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Vire nosso Parceiro
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Preencha o formulário abaixo e entraremos em contato com uma proposta customizada para
            sua empresa.
          </p>

          {submitSuccess && (
            <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Mensagem enviada com sucesso!</p>
                  <p className="text-sm text-green-700">
                    Entraremos em contato em breve com mais informações.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-900 mb-2">
                  Nome Completo
                </label>
                <input
                  {...register('nome')}
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="Seu nome"
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Empresa */}
              <div>
                <label htmlFor="empresa" className="block text-sm font-medium text-gray-900 mb-2">
                  Empresa
                </label>
                <input
                  {...register('empresa')}
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="Sua empresa"
                />
                {errors.empresa && (
                  <p className="mt-1 text-sm text-red-600">{errors.empresa.message}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-900 mb-2">
                  Telefone
                </label>
                <input
                  {...register('telefone')}
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="(42) 99999-9999"
                />
                {errors.telefone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
                )}
              </div>
            </div>

            {/* Mensagem */}
            <div>
              <label htmlFor="mensagem" className="block text-sm font-medium text-gray-900 mb-2">
                Mensagem
              </label>
              <textarea
                {...register('mensagem')}
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none"
                placeholder="Conte-nos sobre seu interesse em patrocinar a SAF Talismã..."
              />
              {errors.mensagem && (
                <p className="mt-1 text-sm text-red-600">{errors.mensagem.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Enviando...' : 'Enviar Proposta'}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Dúvidas Frequentes</h2>

          <div className="space-y-6">
            {[
              {
                q: 'Como funciona o patrocínio?',
                a: 'Analisamos o perfil da sua empresa e elaboramos um pacote customizado com ações específicas para alcançar seus objetivos de marketing.',
              },
              {
                q: 'Qual é o investimento mínimo?',
                a: 'Trabalhamos com diferentes orçamentos. Não há investimento mínimo fixo - tudo é negociável conforme o escopo das ações.',
              },
              {
                q: 'Posso acompanhar os resultados?',
                a: 'Sim! Fornecemos relatórios mensais com métricas de alcance, engajamento e ROI das ações patrocinadas.',
              },
              {
                q: 'Quanto tempo dura um patrocínio?',
                a: 'Podem ser mensais, semestrais ou anuais. Você escolhe o período que melhor se adequa aos seus objetivos.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 border-l-4 border-accent-500">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
