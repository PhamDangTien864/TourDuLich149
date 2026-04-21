import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bizweb.dktcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cms.attractionsvietnam.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'danangfantasticity.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'visitphuquoc.com.vn',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
