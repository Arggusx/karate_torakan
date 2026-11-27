import "server-only";

/**
 * Confere o token do captcha (Cloudflare Turnstile) direto com a Cloudflare.
 *
 * TURNSTILE_SECRET_KEY fica só no servidor (Vercel › Environment Variables).
 * Fora de produção, sem a variável, usa a chave secreta de teste da
 * Cloudflare, que sempre aprova: o login funciona no localhost.
 * Nos previews da Vercel sem a variável, o captcha fica desligado. No site
 * publicado (VERCEL_ENV=production) sem a variável, o login é recusado: é
 * melhor ninguém entrar e o erro aparecer no log do que aceitar robôs.
 */

const VERIFICAR = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SEGREDO_DE_TESTE = "1x0000000000000000000000000000000AA";

function segredo(): string {
  return (
    process.env.TURNSTILE_SECRET_KEY?.trim() ||
    (process.env.NODE_ENV === "production" ? "" : SEGREDO_DE_TESTE)
  );
}

export function captchaAtivo(): boolean {
  return Boolean(segredo());
}

export async function captchaValido(
  token: string | undefined,
  ip: string | null,
): Promise<boolean> {
  const chave = segredo();
  if (!chave) {
    // No site publicado (VERCEL_ENV=production), sem a chave o login fica
    // fechado: entrar sem captcha seria aceitar robôs sem ninguém perceber.
    // Nos previews da Vercel (sem a chave) o captcha segue desligado.
    if (process.env.VERCEL_ENV === "production") {
      console.error("[turnstile] TURNSTILE_SECRET_KEY ausente em produção: login recusado");
      return false;
    }
    return true;
  }
  if (!token) return false;

  const corpo = new URLSearchParams({ secret: chave, response: token });
  if (ip) corpo.set("remoteip", ip);

  try {
    const resposta = await fetch(VERIFICAR, {
      method: "POST",
      body: corpo,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const dados = (await resposta.json()) as { success?: boolean };
    return dados.success === true;
  } catch (erro) {
    // Cloudflare fora do ar ou lenta: recusa, e a pessoa tenta de novo.
    console.error("[turnstile]", erro);
    return false;
  }
}

/** IP de quem chamou, como a Vercel repassa. */
export function ipDaRequisicao(request: Request): string | null {
  const encaminhado = request.headers.get("x-forwarded-for");
  return (
    encaminhado?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}
