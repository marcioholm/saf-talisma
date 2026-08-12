import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Transformando Vidas através do Futsal
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8">
            Desde 2009, formamos não apenas atletas, mas cidadãos com caráter, disciplina e oportunidades para o futuro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/patrocinadores#contato"
              className="inline-block bg-accent-600 hover:bg-accent-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors text-center"
            >
              Torne-se Parceiro
            </Link>
            <Link
              href="/sobre"
              className="inline-block bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors text-center border-2 border-white"
            >
              Saiba Mais
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 hidden lg:block"></div>
    </div>
  );
}
