// build.sh sets BASE_PATH to the folder the static deploy serves this app from
const basePath = (process.env.BASE_PATH ?? "/").replace(/\/$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // A static export (out/), so it can live on the Web Mountain site with no server
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
