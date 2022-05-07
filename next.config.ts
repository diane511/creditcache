import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "10.214.44.1",
    "172.25.144.1",
    "172.20.10.8",
    "172.24.64.1",
  ],
};

export default nextConfig;