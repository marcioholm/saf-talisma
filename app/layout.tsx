import type { Metadata } from "next";
import { associationConfig } from "../lib/association-config";
import "./globals.css";

const SITE = "https://saftalisma.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${associationConfig.name} | ${associationConfig.slogan}`,
    template: `%s | ${associationConfig.name}`,
  },
  description: `Site oficial da ${associationConfig.name}. Notícias, jogos, categorias e a história do futsal de ${associationConfig.location.split(",")[0]}.`,
  keywords: [
    "SAF Talismã",
    "Associação Esportiva",
    "futsal",
    "Arapoti",
    "Campos Gerais",
    "Paraná",
    "esporte",
    "formação de atletas",
  ],
  authors: [{ name: associationConfig.name, url: SITE }],
  creator: associationConfig.name,
  publisher: associationConfig.name,
  alternates: {
    canonical: SITE,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE,
    siteName: associationConfig.name,
    title: `${associationConfig.name} | ${associationConfig.slogan}`,
    description: `Site oficial da ${associationConfig.name}. Notícias, jogos, categorias e a história do futsal de Arapoti e dos Campos Gerais do Paraná.`,
    images: [
      {
        url: `${SITE}/logo-saf.svg`,
        width: 512,
        height: 512,
        alt: associationConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${associationConfig.name} | ${associationConfig.slogan}`,
    description: `Site oficial da ${associationConfig.name}. Notícias, jogos e a história do futsal de Arapoti.`,
    images: [`${SITE}/logo-saf.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo-saf.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Favicon e logo */}
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/logo-saf.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
