import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /**
   * Sin esto, `/entrada/:id` no coincide con `app/[locale]/entrada/[entryId]` (falta el segmento
   * `[locale]`). El proxy de next-intl suele reescribir a `/es/entrada/:id`, pero este rewrite
   * asegura la misma resolución si el proxy no aplica (p. ej. entornos raros o orden de capas).
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          destination: "/en/entrada/:entryId",
          has: [{ key: "NEXT_LOCALE", type: "cookie", value: "en" }],
          source: "/entrada/:entryId",
        },
        {
          destination: "/es/entrada/:entryId",
          source: "/entrada/:entryId",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
        source: "/actividad/confirmacion",
      },
      {
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
        source: "/en/actividad/confirmacion",
      },
    ];
  },
  async redirects() {
    return [
      {
        destination: "/actividad/confirmacion",
        permanent: true,
        source: "/success",
      },
      {
        destination: "/en/actividad/confirmacion",
        permanent: true,
        source: "/en/success",
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        hostname: "flagcdn.com",
        pathname: "/w80/**",
        protocol: "https",
      },
      {
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
        protocol: "https",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
