import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/behavior/kneading",
        destination: "/behavior/making-biscuits",
        permanent: true,
      },
      {
        source: "/facts/are-cats-social",
        destination: "/behavior/are-cats-social-animals",
        permanent: true,
      },
      {
        source: "/diseases/cat-allergies",
        destination: "/health/cat-allergies",
        permanent: true,
      },
      {
        source: "/diseases/strep-in-cats",
        destination: "/health/strep-in-cats",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "live.staticflickr.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
