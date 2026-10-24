/**
 * Ícones de navegação dos portais.
 *
 * Todos desenhados na mesma grade de 24, com traço de 1.8 e pontas
 * arredondadas — é isso que faz o conjunto parecer uma família só, e não
 * ícones colhidos de lugares diferentes.
 */
export type NomeIcone =
  | "turmas"
  | "alunos"
  | "professores"
  | "chamada"
  | "financeiro"
  | "perfil"
  | "horarios"
  | "curriculo"
  | "estudos"
  | "inicio"
  | "sair"
  | "cadastro";

export function IconePortal({
  nome,
  className = "h-5 w-5",
}: {
  nome: NomeIcone;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {TRACOS[nome]}
    </svg>
  );
}

const TRACOS: Record<NomeIcone, React.ReactNode> = {
  turmas: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
    </>
  ),
  alunos: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16.5 5.6a3.2 3.2 0 0 1 0 5.8M18 14.3A6.5 6.5 0 0 1 21.5 20" />
    </>
  ),
  professores: (
    <>
      <path d="M12 3.5 22 8.2l-10 4.7L2 8.2z" />
      <path d="M6 10.6V16c0 1.7 2.7 3.1 6 3.1s6-1.4 6-3.1v-5.4" />
      <path d="M22 8.2v5.4" />
    </>
  ),
  chamada: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M8 2.8v3.4M16 2.8v3.4M3 9.5h18" />
      <path d="M9 14.6l2 2 4-4" />
    </>
  ),
  financeiro: (
    <>
      <path d="M12 2.8v18.4" />
      <path d="M16.5 6.6H9.8a3 3 0 0 0 0 6h4.4a3 3 0 0 1 0 6H7" />
    </>
  ),
  perfil: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.2a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  horarios: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.4 2" />
    </>
  ),
  curriculo: (
    <>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
      <path d="M4 19.5A1.5 1.5 0 0 1 5.5 21H19" />
      <path d="M8 7.5h7M8 11h5" />
    </>
  ),
  estudos: (
    <>
      <path d="M12 6.8C10.4 5.3 8.2 4.5 5.5 4.5H3v13h2.5c2.7 0 4.9.8 6.5 2.3" />
      <path d="M12 6.8c1.6-1.5 3.8-2.3 6.5-2.3H21v13h-2.5c-2.7 0-4.9.8-6.5 2.3z" />
      <path d="M12 6.8v13" />
    </>
  ),
  inicio: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.2V20h13V9.2" />
      <path d="M10 20v-5.5h4V20" />
    </>
  ),
  sair: (
    <>
      <path d="M14.5 3.5h3A2.5 2.5 0 0 1 20 6v12a2.5 2.5 0 0 1-2.5 2.5h-3" />
      <path d="M10 16.5 14.5 12 10 7.5" />
      <path d="M14.5 12H3.5" />
    </>
  ),
  cadastro: (
    <>
      <circle cx="9.5" cy="8" r="3.4" />
      <path d="M3 20a6.5 6.5 0 0 1 11.5-4.1" />
      <path d="M18.5 14v6M15.5 17h6" />
    </>
  ),
};
