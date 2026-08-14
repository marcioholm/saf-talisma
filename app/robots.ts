import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/inscricoes/",
          "/login/",
          "/*?token=",
          "/*?preview=",
        ],
      },
    ],
    sitemap: [
      "https://saftalisma.com.br/sitemap.xml",
      "https://saftalisma.com.br/sitemap-news.xml",
    ],
  };
}
