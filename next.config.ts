import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost", "capacitor://localhost"],
    },
  },
};

export default nextConfig;
