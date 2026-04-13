import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "./",
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost", "capacitor://localhost"],
    },
  },
};

export default nextConfig;
