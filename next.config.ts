import type { NextConfig } from "next";

const supabaseInternalUrl =
  process.env.SUPABASE_INTERNAL_URL ?? "http://127.0.0.1:54321";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/supabase/:path*",
        destination: `${supabaseInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
