/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // A Jornada saiu do ar (o código está guardado na branch `jornada`).
      // Links antigos levam à home dos estudos. Temporário (307) porque ela
      // pode voltar: um 308 ficaria gravado no navegador de quem visitou.
      {
        source: "/estudos/jornada/:caminho*",
        destination: "/estudos",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
