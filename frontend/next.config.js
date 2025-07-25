/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*",
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:5001",
  },
};

module.exports = nextConfig;
