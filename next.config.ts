import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
