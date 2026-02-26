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
      {
        source: "/generated-models/:path*",
        destination: "https://yamlbkhubodoxxaavtva.supabase.co/:path*",
      }
    ];
  },
};

export default nextConfig;
