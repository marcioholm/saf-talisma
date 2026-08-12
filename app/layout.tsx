import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAF Talismã | O clube do Norte Pioneiro",
  description: "Site oficial da SAF Talismã. Notícias, jogos, categorias e a história do futsal de Wenceslau Braz.",
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
