import type { NextConfig } from "next";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

function pkgDir(name: string) {
  return path.dirname(require.resolve(`${name}/package.json`));
}

const nextConfig: NextConfig = {
  basePath: "/auth",
  assetPrefix: "/auth",
  transpilePackages: ["@ross2p/shared"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: pkgDir("react"),
      "react-dom": pkgDir("react-dom"),
      "@tanstack/react-query": pkgDir("@tanstack/react-query"),
    };
    return config;
  },
};

export default nextConfig;
