import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const isDev = process.env.NODE_ENV === "development";

// next-pwa generates the service worker during build.
// On Vercel (production) it will be enabled; locally it's disabled by default.
export default withPWA({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true,
})(nextConfig);
