import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@crawlee/cheerio",
    "@crawlee/core",
    "crawlee",
    "@napi-rs/canvas",
    "pdf-parse",
    "pdfjs-dist"
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb"
    }
  }
};

export default nextConfig;
