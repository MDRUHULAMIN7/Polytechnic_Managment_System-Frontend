/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  /**
   * Do NOT add a rewrite from `/api/proxy/*` to localhost (or any fixed host).
   * Next applies rewrites before route handlers, so that would bypass
   * `app/api/proxy/[...path]/route.ts` and break Vercel (localhost → private / wrong host).
   * Proxying is handled only by that route using `NEXT_PUBLIC_API_BASE_URL`.
   */
};

export default nextConfig;
