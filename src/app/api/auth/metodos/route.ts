import { NextResponse } from "next/server";
import { googleConfigurado } from "@/server/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/metodos — quais formas de entrar estão ligadas neste ambiente.
 * O botão do Google só aparece se as variáveis do Google existirem; assim a
 * homologação sem credenciais não mostra um botão que leva a erro.
 */
export async function GET() {
  return NextResponse.json({ google: googleConfigurado() });
}
