import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "1";
const basePath = "/tdc/2026/acm-ossm";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  ...(isGitHubPages
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
        // ponytail: static Pages export only needs app/; skip CF worker/db typecheck
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
};

export default nextConfig;
