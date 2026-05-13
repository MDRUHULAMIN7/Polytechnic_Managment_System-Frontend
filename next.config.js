/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `http://localhost:5000/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
