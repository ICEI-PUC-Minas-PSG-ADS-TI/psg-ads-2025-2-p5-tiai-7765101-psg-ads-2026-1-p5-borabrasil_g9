/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.senado.leg.br",
        pathname: "/senadores/img/**",
      },
      {
        protocol: "https",
        hostname: "legis.senado.leg.br",
      },
      {
        protocol: "https",
        hostname: "www.camara.leg.br",
        pathname: "/internet/deputado/bandep/**",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
