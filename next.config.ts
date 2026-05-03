import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/auth",
  assetPrefix: "/auth",
  transpilePackages: ["@ross2p/shared"],
};

export default nextConfig;
