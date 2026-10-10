import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.20.10.2"],
  redirects() {
    return ["identity", "portfolio", "print"].map(slug => ({
      source: `/work/${slug}`,
      destination: "/work/thvgger",
      permanent: true,
    }));
  },
};

export default nextConfig;
