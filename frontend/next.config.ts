import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    // Disable trace to avoid permission issues on Windows
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
