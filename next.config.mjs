const emDesenvolvimento = process.env.NODE_ENV !== "production";

/**
 * Política de conteúdo (CSP): de onde a página pode carregar cada coisa.
 *
 * Terceiros liberados, e por quê:
 *  - challenges.cloudflare.com — verificação contra robôs (Turnstile) no login;
 *  - youtube.com / youtube-nocookie.com — vídeos dos katas, depois do clique;
 *  - google.com / maps.google.com — mapa da academia, depois do clique.
 * Stripe e Mercado Pago não entram: o pagamento abre na página deles, e o QR
 * do PIX chega como imagem em base64.
 *
 * 'unsafe-inline' em script-src é exigência do Next sem nonce (os scripts de
 * hidratação vêm embutidos no HTML). Só em desenvolvimento: 'unsafe-eval',
 * para o recarregamento rápido, e va.vercel-scripts.com, de onde o Vercel
 * Analytics puxa o script de depuração (em produção ele vem do próprio site).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${emDesenvolvimento ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(emDesenvolvimento ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const cabecalhosDeSeguranca = [
  { key: "Content-Security-Policy", value: csp },
  // Ninguém exibe o site dentro de um iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Outros sites só veem de qual domínio o visitante veio, sem o caminho.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // HTTPS obrigatório por 2 anos, também em portal. e academy.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:caminho*", headers: cabecalhosDeSeguranca }];
  },

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
