import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    return [
      {
        source: "/meshy-assets/:path*",
        destination: "https://assets.meshy.ai/:path*",
      },
    ];
  },
};

export default nextConfig;
