import type { Metadata } from 'next';
import { Archivo, Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import './globals.css';

const display = Archivo({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SAF Talismã - Transformando vidas através do futsal',
  description:
    'Associação SAF Talismã: formação de atletas e desenvolvimento humano desde 2009. Sub-13, Sub-15 e Masculino.',
  keywords: [
    'futsal',
    'Arapoti',
    'esporte',
    'formação atlética',
    'sub-13',
    'sub-15',
    'desenvolvimento juvenil',
  ],
  authors: [{ name: 'SAF Talismã' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://saftalisma.com.br',
    siteName: 'SAF Talismã',
    title: 'SAF Talismã - Transformando vidas através do futsal',
    description:
      'Associação SAF Talismã: formação de atletas e desenvolvimento humano desde 2009.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-sans bg-white text-gray-900 antialiased`}
      >
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
