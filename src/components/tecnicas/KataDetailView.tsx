import Link from "next/link";
import { Embusen } from "@/components/tecnicas/Embusen";
import { EmbusenImage } from "@/components/tecnicas/EmbusenImage";
import { NavegacaoKata } from "@/components/tecnicas/NavegacaoKata";
import { SequenciaMovimentos } from "@/components/tecnicas/SequenciaMovimentos";
import { Badge, BeltBadge } from "@/components/ui/Badge";
import { acharTecnica, listarDestaques } from "@/services/dataService";
import { tracadoDoKata } from "@/services/embusen";
import type { KataCompleto } from "@/types";

export function KataDetailView({
  kata,
  anterior,
  proximo,
}: {
  kata: KataCompleto;
  anterior: KataCompleto | null;
  proximo: KataCompleto | null;
}) {
  const tracado = tracadoDoKata(kata.id);

  const ficha = [
    { label: "Movimentos", valor: String(kata.quantidadeMovimentos) },
    { label: "Kiais", valor: kata.posicoesKiai },
    { label: "Origem", valor: kata.origemLinhagem ?? kata.categoria },
    {
      label: "Duração",
      valor: kata.duracaoSegundos ? `~${kata.duracaoSegundos}s` : kata.nivelDificuldade,
    },
  ];

  /* As duas notas de contagem viram um bloco só: são a mesma conversa. */
  const notasDeContagem = [kata.observacaoContagem, kata.contagemAlternativa].filter(
    Boolean,
  ) as string[];

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="card p-5">
        <Link
          href="/estudos/tecnicas"
          className="inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-elevated px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-accent hover:text-accent"
        >
          <span aria-hidden>←</span> Voltar para Técnicas
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="accent">{kata.categoria}</Badge>
          <BeltBadge cor={kata.corFaixa}>{kata.faixaRecomendada}</BeltBadge>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <h1 className="heading-xl">{kata.nome}</h1>
          {kata.kanji ? (
            <span className="text-lg text-subtle">{kata.kanji}</span>
          ) : null}
        </div>
        <p className="mt-1.5 text-sm font-medium text-accent">
          {kata.significadoNome}
        </p>

        {/* Tradução com a decomposição dos termos japoneses. */}
        {kata.significadoLiteral ? (
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted">
            {kata.significadoLiteral}
          </p>
        ) : null}

        {kata.resumo ? (
          <>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-fg/85">
              {kata.resumo.text}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {kata.resumo.decomposicao.map((parte) => (
                <span
                  key={parte.termo}
                  className="rounded border border-line bg-elevated px-2 py-1 text-2xs text-muted"
                >
                  <span className="font-medium text-fg">{parte.termo}</span> ·{" "}
                  {parte.significado}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Ficha técnica */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
          {ficha.map((item) => (
            <div key={item.label} className="px-4 py-3">
              <p className="label">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-fg">{item.valor}</p>
            </div>
          ))}
        </div>

        {/*
          Onde as escolas divergem sobre a contagem, o site diz isso em vez de
          escolher um número e calar o resto — é material de preparação para
          exame, e o aluno precisa saber que existe outra contagem.
        */}
        {notasDeContagem.length ? (
          <div className="border-t border-line bg-elevated px-4 py-2.5">
            <p className="label">Sobre a contagem</p>
            <ul className="mt-1 space-y-1">
              {notasDeContagem.map((nota) => (
                <li key={nota} className="text-2xs leading-relaxed text-muted">
                  {nota}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Vídeo */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Vídeo demonstrativo</h2>
            <span className="text-2xs text-subtle">YouTube</span>
          </div>
          <div className="relative aspect-video w-full bg-elevated">
            {kata.videoUrl ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={kata.videoUrl}
                title={`Kata ${kata.nome} — demonstração`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-muted">Vídeo não cadastrado.</p>
              </div>
            )}
          </div>
        </section>

        {/*
          Enquanto o kata não tem traçado em coordenadas, ficam os dois espaços
          reservados para as imagens. Quando tem, o diagrama interativo entra no
          lugar — ele faz o que as duas imagens fariam, e ainda anda.
        */}
        {tracado ? null : (
          <section className="card">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <h2 className="heading-md">Embusen</h2>
              <span className="text-2xs text-subtle">Linha de atuação</span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <EmbusenImage
                src={kata.embusenOficialImg}
                alt={`Embusen oficial do kata ${kata.nome}`}
                legenda="Oficial"
              />
              <EmbusenImage
                src={kata.embusenCompletoImg}
                alt={`Embusen completo do kata ${kata.nome}`}
                legenda="Completo"
              />
            </div>
          </section>
        )}
      </div>

      {/*
        O que o kata treina, segundo o cartaz da ISO. Fica separado do bunkai
        porque responde outra pergunta: bunkai é "para que serve o movimento",
        isto é "para que serve o kata".
      */}
      {kata.comentario?.length ? (
        <section className="card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="heading-md">O que este kata treina</h2>
            <span className="text-2xs text-subtle">ISO · 2013</span>
          </div>
          <ol className="divide-y divide-line">
            {kata.comentario.map((item, index) => (
              <li key={index} className="flex gap-2.5 px-4 py-2.5">
                <span className="text-2xs font-medium tabular-nums text-gold">
                  {["I", "II", "III", "IV", "V"][index] ?? index + 1}
                </span>
                <span className="text-xs leading-relaxed text-fg/85">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Destaques + bunkai */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/*
          As técnicas destaque deixam de ser etiqueta solta: cada uma mostra o
          que significa e leva para a ficha no catálogo de kihon. É a ponte
          que faltava entre a página do kata e a de Técnicas.
        */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Técnicas destaque</h2>
            <span className="text-2xs text-subtle">toque para ver a ficha</span>
          </div>
          <ul className="divide-y divide-line">
            {listarDestaques(kata).map((destaque) => {
              const ficha = acharTecnica(destaque);
              return (
                <li key={destaque}>
                  {ficha ? (
                    <Link
                      href={`/estudos/tecnicas#${encodeURIComponent(ficha.nome)}`}
                      className="flex items-baseline justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-elevated"
                    >
                      <span className="text-xs font-medium text-fg">
                        {destaque}
                        {ficha.kanji ? (
                          <span className="ml-1.5 font-kanji text-2xs text-subtle">
                            {ficha.kanji}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-2xs text-muted">
                        {ficha.pt}
                      </span>
                    </Link>
                  ) : (
                    <span className="flex px-4 py-2.5 text-xs text-fg/85">
                      {destaque}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Bunkai — aplicações</h2>
          </div>
          <ul className="divide-y divide-line">
            {kata.bunkai.map((aplicacao, index) => (
              <li key={index} className="flex gap-2.5 px-4 py-2.5">
                <span className="text-2xs font-medium tabular-nums text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xs leading-relaxed text-fg/85">
                  {aplicacao}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Embusen — só aparece para os katas com traçado conferido. */}
      {tracado ? (
        <Embusen tracado={tracado} movimentos={kata.movimentos} />
      ) : null}

      {/* Sequência completa, com prévia e expansão animada. */}
      <SequenciaMovimentos movimentos={kata.movimentosDetalhados} />

      {/* Navegação sequencial, com virada de página. */}
      <NavegacaoKata anterior={anterior} proximo={proximo} />

      {/*
        Segundo botão de voltar. A página é longa — depois de percorrer 65
        movimentos ninguém rola de volta até o topo para sair dela.
      */}
      <div className="flex justify-center pb-2">
        <Link
          href="/estudos/tecnicas"
          className="inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-elevated px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
        >
          <span aria-hidden>←</span> Voltar para Técnicas
        </Link>
      </div>
    </div>
  );
}
