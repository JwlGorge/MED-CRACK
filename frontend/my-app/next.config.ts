/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended for development & production

  // Rewrites to proxy Next.js requests to your FastAPI backend
  async rewrites() {
    return [
      {
        source: "/questions/:path*",      // Example: /questions/Biology
        destination: "http://localhost:8000/questions/Biology", // FastAPI backend
      },
      {
        source: "/login",                 // Example: /login
        destination: "http://localhost:8000/login",
      },
      {
        source: "/signup",                // Example: /signup
        destination: "http://localhost:8000/signup",
      },
      {
        source: "/api/:path*",            // Example: /api/submit-quiz
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
