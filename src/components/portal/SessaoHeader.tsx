"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MenuMobile,
  MenuMobileLink,
  MenuMobileSeparador,
} from "@/components/layout/MenuMobile";
import { AvatarMini } from "@/components/portal/AvatarMini";
import { EVENTO_CONTA } from "@/components/portal/MinhaConta";
import { Button } from "@/components/ui/Button";
import { useAcademia } from "@/lib/academiaStore";
import { DESTINO_POR_PERFIL } from "@/services/dataService";

const ROTULO = {
  aluno: "Aluno",
  professor: "Professor",
  admin: "Admin",
} as const;

function iniciais(nome: string) {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "";
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

/** Identifica quem está logado e encerra a sessão. */
export function SessaoHeader() {
  const router = useRouter();
  const { carregado, sessao, sair } = useAcademia();
  const [foto, setFoto] = useState<string | null>(null);

  // A foto vem da própria conta (vale para os três perfis, inclusive admin,
  // que não aparece em nenhuma lista). Minha conta avisa quando ela muda.
  const id = sessao?.id;
  useEffect(() => {
    setFoto(null);
    if (!id) return;
    let vivo = true;
    fetch("/api/conta", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((dados) => {
        if (vivo) setFoto(dados?.conta?.avatar_url ?? null);
      })
      .catch(() => {});
    const mudou = (evento: Event) =>
      setFoto((evento as CustomEvent<{ avatarUrl: string | null }>).detail.avatarUrl);
    window.addEventListener(EVENTO_CONTA, mudou);
    return () => {
      vivo = false;
      window.removeEventListener(EVENTO_CONTA, mudou);
    };
  }, [id]);

  if (!carregado) return <span className="h-9 w-24" />;

  if (!sessao) {
    return (
      <>
        <Button
          size="sm"
          variant="secondary"
          className="hidden sm:inline-flex"
          onClick={() => router.push("/login")}
        >
          Entrar
        </Button>
        <MenuMobile className="sm:hidden" rotulo="Abrir menu do portal">
          <MenuMobileLink href="/login">Entrar</MenuMobileLink>
          <MenuMobileLink href="/estudos">Portal de estudos</MenuMobileLink>
          <MenuMobileLink href="/">Página inicial</MenuMobileLink>
        </MenuMobile>
      </>
    );
  }

  function encerrar() {
    sair();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop: identificação e sair */}
      <div className="hidden items-center gap-2 sm:flex">
        <AvatarMini src={foto} iniciais={iniciais(sessao.nome)} tamanho="md" />
        <span className="text-right">
          <span className="block text-2xs font-medium text-fg">
            {sessao.nome}
          </span>
          <span className="block font-mono text-[10px] text-subtle">
            {sessao.usuario} · {ROTULO[sessao.perfil]}
          </span>
        </span>
        <Button size="sm" variant="secondary" onClick={encerrar}>
          Sair
        </Button>
      </div>

      {/* Mobile: tudo dentro do menu */}
      <MenuMobile className="sm:hidden" rotulo="Abrir menu do portal">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <AvatarMini src={foto} iniciais={iniciais(sessao.nome)} tamanho="md" />
          <div>
            <p className="text-xs font-medium text-fg">{sessao.nome}</p>
            <p className="font-mono text-[10px] text-subtle">
              {sessao.usuario} · {ROTULO[sessao.perfil]}
            </p>
          </div>
        </div>
        <MenuMobileSeparador />
        <MenuMobileLink href={DESTINO_POR_PERFIL[sessao.perfil]}>
          Meu portal
        </MenuMobileLink>
        <MenuMobileLink href="/estudos">Portal de estudos</MenuMobileLink>
        <MenuMobileLink href="/">Página inicial</MenuMobileLink>
        <MenuMobileSeparador />
        <button
          type="button"
          onClick={encerrar}
          className="flex w-full items-center rounded px-3 py-2 text-left text-sm font-medium text-accent transition-colors hover:bg-elevated"
        >
          Sair
        </button>
      </MenuMobile>
    </>
  );
}
