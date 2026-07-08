import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve next-gen formats first. Vercel/Cloudinary will pick AVIF when
    // the browser supports it, then WebP, then the original.
    formats: ["image/avif", "image/webp"],
    // Keep optimized variants on the CDN for a year — products don't change
    // often, so re-optimizing on every visit is wasted CPU.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // Speeds up cold builds; no runtime impact.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Compress responses for the public surface.
  compress: true,
  // Preconnect hints for the heaviest third-party origins are added in
  // <head> from src/app/layout.tsx.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
