"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconePortal } from "@/components/portal/IconePortal";
import { useAcademia } from "@/lib/academiaStore";

/**
 * Pé do trilho lateral: atalho para o portal de estudos e o botão de sair.
 *
 * Lê `data-trilho-aberto` do contêiner pai (escrito pelo NavPortal) para saber
 * se mostra os rótulos ou só os ícones centrados — assim o rodapé acompanha o
 * recolher do menu sem precisar de mais um estado.
 */
export function RodapePortal() {
  const router = useRouter();
  const { sair } = useAcademia();

  function encerrar() {
    sair();
    router.push("/login");
  }

  return (
    <div className="w-full space-y-0.5">
      <Link
        href="/estudos"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-fg [[data-trilho-aberto='0']_&]:justify-center"
        title="Portal de estudos"
      >
        <IconePortal nome="estudos" className="h-5 w-5 shrink-0" />
        <span className="truncate [[data-trilho-aberto='0']_&]:hidden">
          Portal de estudos
        </span>
      </Link>
      <button
        type="button"
        onClick={encerrar}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 [[data-trilho-aberto='0']_&]:justify-center"
        title="Sair"
      >
        <IconePortal nome="sair" className="h-5 w-5 shrink-0" />
        <span className="truncate [[data-trilho-aberto='0']_&]:hidden">
          Sair
        </span>
      </button>
    </div>
  );
}
