/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended for development & production
  devIndicators: false,

  // Rewrites to proxy Next.js requests to your FastAPI backend
  async rewrites() {
    return [
      {
        source: "/questions/:path*",      // Example: /questions/Biology
        destination: `${process.env.BACKEND_URL || "https://med-crack.onrender.com"}/questions/:path*`,
      },
      {
        source: "/login",                 // Example: /login
        destination: `${process.env.BACKEND_URL || "https://med-crack.onrender.com"}/login`,
      },
      {
        source: "/signup",                // Example: /signup
        destination: `${process.env.BACKEND_URL || "https://med-crack.onrender.com"}/signup`,
      },
      {
        source: "/api/:path*",            // Example: /api/submit-quiz
        destination: `${process.env.BACKEND_URL || "https://med-crack.onrender.com"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
