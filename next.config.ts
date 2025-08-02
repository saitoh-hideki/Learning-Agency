import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Supabase Edge Functionsを除外
    config.module.rules.push({
      test: /supabase\/functions/,
      use: 'ignore-loader'
    });
    return config;
  },
};

export default nextConfig;
