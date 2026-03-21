import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@base-ui/react", "@hugeicons/react", "dinn-lexical"],
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mowzqxruruhcvjgpzzdb.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/dinn_dev/**",
      },
      {
        protocol: "https",
        hostname: "octodex.github.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
