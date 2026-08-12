import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre a SAF Talismã</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Transformando vidas através do esporte desde 2009
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Missão</h3>
              <p className="text-gray-700 leading-relaxed">
                Promover o desenvolvimento humano e esportivo por meio do futsal, formando
                atletas disciplinados, cidadãos responsáveis e profissionais preparados para os
                desafios dentro e fora de campo.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 border border-purple-200">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visão</h3>
              <p className="text-gray-700 leading-relaxed">
                Ser reconhecida como uma referência na formação de talentos e na gestão
                profissional do futsal, criando oportunidades para jovens atletas e contribuindo
                para o crescimento do esporte e da comunidade.
              </p>
            </div>

            {/* Values */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 border border-green-200">
              <div className="text-4xl mb-4">💪</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Valores</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Disciplina
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Respeito
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Espírito de equipe
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Formação humana
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Nossa História</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  year: '2009',
                  title: 'Fundação',
                  description:
                    'A SAF Talismã é fundada com o objetivo de formar atletas e desenvolver o futsal em Arapoti e região.',
                },
                {
                  year: '2012',
                  title: 'Expansão',
                  description:
                    'Começamos a participar de competições estaduais, consolidando nossa presença no futsal paranaense.',
                },
                {
                  year: '2015',
                  title: 'Categorias Menores',
                  description:
                    'Iniciamos o trabalho com categorias de base (Sub-13 e Sub-15), focando na formação de jovens talentos.',
                },
                {
                  year: '2020',
                  title: 'Profissionalização',
                  description:
                    'Implementamos gestão profissional dos processos, alinhando nossa estrutura aos padrões internacionais.',
                },
                {
                  year: '2024',
                  title: 'Atualidade',
                  description:
                    'Continuamos crescendo, formando talentos e transformando vidas através do futsal.',
                },
              ].map((milestone, idx) => (
                <div key={idx} className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    {idx < 4 && (
                      <div className="w-1 h-16 bg-primary-200 my-2"></div>
                    )}
                  </div>
                  <div className="pb-8">
                    <div className="text-sm font-semibold text-primary-600 uppercase">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team/Estructura */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nossa Estrutura
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Administrativo',
                items: ['Gestão de Projetos', 'Financeiro', 'Recursos Humanos'],
              },
              {
                title: 'Esportivo',
                items: ['Treinadores', 'Preparador Físico', 'Fisioterapeuta'],
              },
              {
                title: 'Comunicação',
                items: ['Redes Sociais', 'Conteúdo', 'Marketing'],
              },
              {
                title: 'Parcerias',
                items: ['Patrocinadores', 'Órgãos Públicos', 'Comunidade'],
              },
            ].map((dept, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{dept.title}</h3>
                <ul className="space-y-2">
                  {dept.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nossas Categorias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: 'Sub-13',
                age: '12 a 13 anos',
                focus: 'Desenvolvimento básico de técnica e táticas fundamentais',
                color: 'from-green-50 to-green-100',
                border: 'border-green-200',
              },
              {
                name: 'Sub-15',
                age: '14 a 15 anos',
                focus: 'Aperfeiçoamento de técnica e introdução a estratégias avançadas',
                color: 'from-purple-50 to-purple-100',
                border: 'border-purple-200',
              },
              {
                name: 'Feminino',
                age: 'Todas as idades',
                focus: 'Futsal feminino com foco em desenvolvimento e competição',
                color: 'from-pink-50 to-pink-100',
                border: 'border-pink-200',
              },
              {
                name: 'Masculino Adulto',
                age: '+16 anos',
                focus: 'Futsal profissional com participação em competições de elite',
                color: 'from-red-50 to-red-100',
                border: 'border-red-200',
              },
            ].map((cat, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${cat.color} rounded-lg p-8 border-2 ${cat.border}`}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{cat.age}</p>
                <p className="text-gray-700 leading-relaxed">{cat.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Quer fazer parte dessa história?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Conheça as oportunidades de parcerias e saiba como contribuir para a formação de
            novos talentos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/patrocinadores"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Torne-se Parceiro
            </Link>
            <Link
              href="/transparencia"
              className="inline-block bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Transparência
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
