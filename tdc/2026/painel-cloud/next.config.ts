import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "1";
const basePath = "/tdc/2026/painel-cloud";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  ...(isGitHubPages
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
        // ponytail: static Pages export; skip unused worker/db typecheck
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
};

export default nextConfig;
