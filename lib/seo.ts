import { associationConfig } from "./association-config";

export const SITE = "https://saftalisma.com.br";
export const OG_IMAGE_DEFAULT = `${SITE}/og-image.jpg`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Generate WebSite + Organization JSON-LD for the homepage */
export function homeJsonLd(): string {
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: associationConfig.name,
      url: SITE,
      description: associationConfig.description,
      inLanguage: "pt-BR",
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      "@id": `${SITE}/#organization`,
      name: associationConfig.institutionalName,
      alternateName: associationConfig.displayName,
      url: SITE,
      logo: `${SITE}/logo-saf.svg`,
      image: OG_IMAGE_DEFAULT,
      description: associationConfig.description,
      sport: "Futsal",
      foundingDate: String(associationConfig.founded),
      address: {
        "@type": "PostalAddress",
        streetAddress: `${associationConfig.legalAddress.street}, ${associationConfig.legalAddress.number}`,
        addressLocality: associationConfig.legalAddress.city,
        addressRegion: associationConfig.legalAddress.state,
        addressCountry: "BR",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: associationConfig.email,
        telephone: associationConfig.phone,
        contactType: "customer service",
        availableLanguage: "Portuguese",
      },
      sameAs: [
        associationConfig.social.instagram,
        associationConfig.social.youtube,
        associationConfig.social.facebook,
      ].filter(Boolean),
    },
  ]);
}

/** Generate NewsArticle JSON-LD for a single post */
export function newsArticleJsonLd(post: {
  titulo: string;
  resumo?: string | null;
  published_at: string;
  updated_at?: string | null;
  autor?: string | null;
  imagem_url?: string | null;
  slug: string;
}): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.titulo,
    description: post.resumo || post.titulo,
    url: `${SITE}/noticias/${post.slug}`,
    mainEntityOfPage: `${SITE}/noticias/${post.slug}`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    image: post.imagem_url || OG_IMAGE_DEFAULT,
    author: {
      "@type": "Organization",
      name: associationConfig.name,
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      name: associationConfig.name,
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/logo-saf.svg`,
      },
    },
    inLanguage: "pt-BR",
  });
}

/** Generate BreadcrumbList JSON-LD */
export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

/** Generate Event JSON-LD */
export function eventJsonLd(event: {
  name: string;
  description?: string | null;
  url: string;
  location?: string | null;
  city?: string | null;
}): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    description: event.description || event.name,
    url: event.url,
    organizer: {
      "@type": "Organization",
      name: associationConfig.name,
      url: SITE,
    },
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: event.city || associationConfig.legalAddress.city,
            addressRegion: "PR",
            addressCountry: "BR",
          },
        }
      : undefined,
    inLanguage: "pt-BR",
  });
}
