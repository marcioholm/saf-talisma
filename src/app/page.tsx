import { Suspense } from 'react';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import SponsorGrid from '@/components/SponsorGrid';
import ResultadoCard from '@/components/ResultadoCard';
import { posts, sponsors, resultados } from '@/lib/supabase';
import Link from 'next/link';

async function FeaturedNews() {
  try {
    const news = await posts.getFeatured(3);
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Últimas Notícias</h2>
            <Link href="/noticias" className="text-primary-600 hover:text-primary-700 font-semibold">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news?.map((post) => (
              <NewsCard key={post.id} {...post} />
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading featured news:', error);
    return null;
  }
}

async function RecentResults() {
  try {
    const data = await resultados.getRecent(5);
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Últimos Resultados</h2>
            <Link href="/transparencia" className="text-primary-600 hover:text-primary-700 font-semibold">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.map((resultado, idx) => (
              <ResultadoCard key={idx} {...resultado} />
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading results:', error);
    return null;
  }
}

async function AllSponsors() {
  try {
    const allSponsors = await sponsors.getAll();
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SponsorGrid sponsors={allSponsors} title="Nossos Patrocinadores" />
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading sponsors:', error);
    return null;
  }
}

async function AboutSection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quem Somos</h2>
            <p className="text-gray-600 text-lg mb-4 leading-relaxed">
              A SAF Talismã é mais do que um clube de futsal. Somos um projeto de formação
              esportiva e humana que acredita no poder do esporte para transformar vidas.
            </p>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Trabalhamos diariamente para desenvolver jovens atletas com disciplina, respeito
              e espírito de equipe, oferecendo oportunidades para que possam crescer dentro e
              fora de campo.
            </p>
            <Link
              href="/sobre"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Saiba Mais
            </Link>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary-600">2009</div>
              <p className="text-primary-700 font-semibold mt-2">Fundada em</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function StatsSection() {
  return (
    <section className="py-16 bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Números que Falam</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">200+</div>
            <p className="text-primary-100">Atletas Ativos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">4</div>
            <p className="text-primary-100">Categorias</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">15</div>
            <p className="text-primary-100">Anos de Atuação</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">50+</div>
            <p className="text-primary-100">Títulos</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      <Suspense fallback={<div className="py-16 text-center text-gray-500">Carregando...</div>}>
        <FeaturedNews />
      </Suspense>

      <Suspense fallback={<div className="py-16 text-center text-gray-500">Carregando...</div>}>
        <AboutSection />
      </Suspense>

      <Suspense fallback={<div className="py-16 text-center text-gray-500">Carregando...</div>}>
        <RecentResults />
      </Suspense>

      <StatsSection />

      <Suspense fallback={<div className="py-16 text-center text-gray-500">Carregando...</div>}>
        <AllSponsors />
      </Suspense>
    </>
  );
}
