"use client";

import { useEffect, useMemo, useState } from "react";
import { KataTable } from "@/components/tecnicas/KataTable";
import { DeslocamentosEmPreparo } from "@/components/tecnicas/DeslocamentosEmPreparo";
import { KihonGrid } from "@/components/tecnicas/KihonGrid";
import { AberturaTecnicas, VitrineKatas } from "@/components/tecnicas/AberturaTecnicas";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { CampoBusca } from "@/components/portal/CampoBusca";
import { PainelFiltros, type ValoresFiltro } from "@/components/ui/PainelFiltros";
import { SegmentedControl } from "@/components/ui/Tabs";
import type { Idioma } from "@/i18n/idioma";
import { CATEGORIAS_EN } from "@/i18n/tecnicas-en";
import { TEXTOS_TECNICAS } from "@/i18n/textos-tecnicas";
import {
  fetchKatas,
  fetchTecnicas,
  getCategoriasTecnicas,
} from "@/services/dataService";
import type { KataCompleto, Tecnica } from "@/types";

type Visao = "kihon" | "katas" | "deslocamentos";

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function filtrarTecnicas(lista: Tecnica[], filtros: ValoresFiltro, busca: string) {
  const termo = semAcento(busca.trim());
  return lista.filter(
    (t) =>
      (!filtros.categoria || t.cat === filtros.categoria) &&
      (!termo || semAcento(`${t.nome} ${t.pt} ${t.tipo}`).includes(termo)),
  );
}

function filtrarKatas(lista: KataCompleto[], filtros: ValoresFiltro, busca: string) {
  const termo = semAcento(busca.trim());
  return lista.filter(
    (k) =>
      (!filtros.categoria || k.categoria === filtros.categoria) &&
      (!filtros.nivel || k.nivel === filtros.nivel) &&
      (!termo || semAcento(`${k.nome} ${k.significadoNome}`).includes(termo)),
  );
}

/**
 * Página de Técnicas (kihon, katas, deslocamentos) nos dois idiomas.
 *
 * Em português os dados vêm do acervo pelo navegador, como sempre. Em inglês
 * a página do servidor já manda as técnicas e os katas traduzidos em
 * `dados`, porque as traduções só existem no servidor.
 */
export function PaginaTecnicas({
  idioma = "pt",
  dados,
}: {
  idioma?: Idioma;
  dados?: { tecnicas: Tecnica[]; katas: KataCompleto[] };
}) {
  const t = TEXTOS_TECNICAS[idioma];

  const visoes = [
    { value: "kihon" as const, label: t.visaoKihon },
    { value: "katas" as const, label: t.visaoKatas },
    // Ashi-sabaki: suri-ashi, yori-ashi, tsugi-ashi. O espaço já fica marcado
    // para o aluno saber que a família existe, antes mesmo do conteúdo entrar.
    { value: "deslocamentos" as const, label: t.visaoDeslocamentos },
  ];

  /*
    Filtros reunidos no botão "Filtros" (como no Oratio): a família da técnica
    no kihon; a série e o nível nos katas. A busca fica sempre à vista.
  */
  const gruposKihon = [
    {
      id: "categoria",
      rotulo: t.filtroFamilia,
      opcoes: getCategoriasTecnicas().map((c) => ({
        id: c.id,
        rotulo: idioma === "en" ? CATEGORIAS_EN[c.id] ?? c.label : c.label,
      })),
    },
  ];

  const gruposKata = [
    {
      id: "categoria",
      rotulo: t.filtroSerie,
      opcoes: [
        { id: "Heian", rotulo: "Heian" },
        { id: "Tekki", rotulo: "Tekki" },
        { id: "Avançados", rotulo: t.serieAvancados },
      ],
    },
    {
      id: "nivel",
      rotulo: t.filtroNivel,
      opcoes: [
        { id: "basico", rotulo: t.nivelBasico },
        { id: "intermediario", rotulo: t.nivelIntermediario },
        { id: "avancado", rotulo: t.nivelAvancado },
      ],
    },
  ];

  const [visao, setVisao] = useState<Visao>("kihon");
  const [filtrosKihon, setFiltrosKihon] = useState<ValoresFiltro>({ categoria: null });
  const [filtrosKata, setFiltrosKata] = useState<ValoresFiltro>({ categoria: null, nivel: null });
  const [busca, setBusca] = useState("");
  // Chegou por um link para uma técnica (#Gedan-Barai): mostra a grade inteira.
  const [porAncora, setPorAncora] = useState(false);
  const [katas, setKatas] = useState<KataCompleto[]>(dados?.katas ?? []);
  const [tecnicas, setTecnicas] = useState<Tecnica[]>(dados?.tecnicas ?? []);
  const [carregando, setCarregando] = useState(!dados);

  useEffect(() => {
    if (dados) return;
    let ativo = true;

    Promise.all([fetchTecnicas(), fetchKatas()]).then(([listaT, listaK]) => {
      if (!ativo) return;
      setTecnicas(listaT);
      setKatas(listaK);
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, [dados]);

  /*
    A lista de técnicas é montada no cliente, então quando o navegador
    processa o `#Gedan-Barai` do link vindo da página do kata o elemento ainda
    não existe e a rolagem não acontece. Aqui a âncora é resolvida de novo,
    depois que os dados chegaram.
  */
  useEffect(() => {
    if (carregando) return;
    const alvo = decodeURIComponent(window.location.hash.slice(1));
    if (!alvo) return;
    setPorAncora(true);

    const elemento = document.getElementById(alvo);
    if (!elemento) return;

    /*
      O App Router restaura a rolagem para o topo depois que o efeito roda, o
      que cancelava o scroll daqui. Esperar um quadro devolve a ordem certa.
    */
    const rolar = window.setTimeout(() => {
      elemento.scrollIntoView({ behavior: "smooth", block: "center" });
      // Pisca a borda para o olho achar o card na grade.
      elemento.classList.add("ring-2", "ring-accent");
      window.setTimeout(
        () => elemento.classList.remove("ring-2", "ring-accent"),
        2000,
      );
    }, 150);

    return () => window.clearTimeout(rolar);
  }, [carregando]);

  const tecnicasFiltradas = useMemo(
    () => filtrarTecnicas(tecnicas, filtrosKihon, busca),
    [tecnicas, filtrosKihon, busca],
  );

  const katasFiltrados = useMemo(
    () => filtrarKatas(katas, filtrosKata, busca),
    [katas, filtrosKata, busca],
  );

  return (
    <>
      <HeroPagina
        sobretitulo={t.sobretitulo}
        titulo={t.titulo}
        imagem="/imagens/dojo.webp"
        kanji="技術"
        descricao={<>{t.descricao(tecnicas.length, katas.length)}</>}
      />

      <div className="section space-y-6 py-10">
      <AberturaTecnicas
        tecnicas={tecnicas.length}
        katas={katas.length}
        familias={getCategoriasTecnicas().filter((c) => tecnicas.some((tec) => tec.cat === c.id)).length}
        idioma={idioma}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          options={visoes}
          value={visao}
          onChange={setVisao}
          destaque
        />
        {visao === "deslocamentos" ? null : (
          <PainelFiltros
            key={visao}
            idioma={idioma}
            grupos={visao === "kihon" ? gruposKihon : gruposKata}
            valores={visao === "kihon" ? filtrosKihon : filtrosKata}
            onAplicar={visao === "kihon" ? setFiltrosKihon : setFiltrosKata}
            contar={(rascunho) =>
              visao === "kihon"
                ? filtrarTecnicas(tecnicas, rascunho, busca).length
                : filtrarKatas(katas, rascunho, busca).length
            }
            antes={
              <CampoBusca
                id="busca-tecnicas"
                valor={busca}
                onChange={setBusca}
                placeholder={visao === "kihon" ? t.buscarTecnica : t.buscarKata}
                rotuloLimpar={t.limparBusca}
                className="w-full sm:w-56"
              />
            }
          />
        )}
      </div>

      {visao === "deslocamentos" ? (
        <DeslocamentosEmPreparo idioma={idioma} />
      ) : carregando ? (
        visao === "kihon" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <SkeletonTable rows={6} />
            <SkeletonTable rows={5} />
          </div>
        )
      ) : visao === "kihon" ? (
        <>
          <section className="painel p-5">
            <p className="eyebrow">Kihon · 基本</p>
            <h2 className="heading-md mt-1">{t.kihonTitulo}</h2>
            <div className="body-muted mt-2 grid gap-2">
              {t.kihonTexto.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
            </div>
          </section>
          <KihonGrid
            tecnicas={tecnicasFiltradas}
            mostrarTudo={porAncora || busca.trim() !== ""}
            idioma={idioma}
          />
        </>
      ) : (
        <div className="space-y-8">
          <VitrineKatas katas={katasFiltrados} idioma={idioma} />
          <KataTable
            titulo={t.katasBasicos}
            descricao={t.katasBasicosDesc}
            katas={katasFiltrados.filter((kata) => kata.nivel === "basico")}
            idioma={idioma}
          />
          <KataTable
            titulo={t.katasIntermediarios}
            descricao={t.katasIntermediariosDesc}
            katas={katasFiltrados.filter(
              (kata) => kata.nivel === "intermediario",
            )}
            idioma={idioma}
          />
          <KataTable
            titulo={t.katasAvancados}
            descricao={t.katasAvancadosDesc}
            katas={katasFiltrados.filter((kata) => kata.nivel === "avancado")}
            idioma={idioma}
          />

          {katasFiltrados.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="body-muted">{t.nenhumKata}</p>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </>
  );
}
