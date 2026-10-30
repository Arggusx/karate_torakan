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
import {
  fetchKatas,
  fetchTecnicas,
  getCategoriasTecnicas,
} from "@/services/dataService";
import type { KataCompleto, Tecnica } from "@/types";

type Visao = "kihon" | "katas" | "deslocamentos";

const VISOES = [
  { value: "kihon" as const, label: "Kihon" },
  { value: "katas" as const, label: "Katas" },
  // Ashi-sabaki: suri-ashi, yori-ashi, tsugi-ashi. O espaço já fica marcado
  // para o aluno saber que a família existe, antes mesmo do conteúdo entrar.
  { value: "deslocamentos" as const, label: "Deslocamentos" },
];

/*
  Filtros reunidos no botão "Filtros" (como no Oratio): a família da técnica
  no kihon; a série e o nível nos katas. A busca fica sempre à vista.
*/
const GRUPOS_KIHON = [
  {
    id: "categoria",
    rotulo: "Família",
    opcoes: getCategoriasTecnicas().map((c) => ({ id: c.id, rotulo: c.label })),
  },
];

const GRUPOS_KATA = [
  {
    id: "categoria",
    rotulo: "Série",
    opcoes: [
      { id: "Heian", rotulo: "Heian" },
      { id: "Tekki", rotulo: "Tekki" },
      { id: "Avançados", rotulo: "Avançados" },
    ],
  },
  {
    id: "nivel",
    rotulo: "Nível",
    opcoes: [
      { id: "basico", rotulo: "Básico" },
      { id: "intermediario", rotulo: "Intermediário" },
      { id: "avancado", rotulo: "Avançado" },
    ],
  },
];

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

export default function TecnicasPage() {
  const [visao, setVisao] = useState<Visao>("kihon");
  const [filtrosKihon, setFiltrosKihon] = useState<ValoresFiltro>({ categoria: null });
  const [filtrosKata, setFiltrosKata] = useState<ValoresFiltro>({ categoria: null, nivel: null });
  const [busca, setBusca] = useState("");
  // Chegou por um link para uma técnica (#Gedan-Barai): mostra a grade inteira.
  const [porAncora, setPorAncora] = useState(false);
  const [katas, setKatas] = useState<KataCompleto[]>([]);
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
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
  }, []);

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
        sobretitulo="Técnicas · 技術"
        titulo="Kihon e Katas"
        imagem="/imagens/dojo.jpg"
        kanji="技術"
        descricao={
          <>
            O kihon é o vocabulário; o kata, a frase completa.{" "}
            {tecnicas.length} técnicas catalogadas e {katas.length} katas com
            ficha técnica, bunkai e sequência de movimentos.
          </>
        }
      />

      <div className="section space-y-6 py-10">
      <AberturaTecnicas
        tecnicas={tecnicas.length}
        katas={katas.length}
        familias={getCategoriasTecnicas().filter((c) => tecnicas.some((t) => t.cat === c.id)).length}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          options={VISOES}
          value={visao}
          onChange={setVisao}
          destaque
        />
        {visao === "deslocamentos" ? null : (
          <PainelFiltros
            key={visao}
            grupos={visao === "kihon" ? GRUPOS_KIHON : GRUPOS_KATA}
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
                placeholder={visao === "kihon" ? "Buscar técnica" : "Buscar kata"}
                className="w-full sm:w-56"
              />
            }
          />
        )}
      </div>

      {visao === "deslocamentos" ? (
        <DeslocamentosEmPreparo />
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
        <KihonGrid tecnicas={tecnicasFiltradas} mostrarTudo={porAncora || busca.trim() !== ""} />
      ) : (
        <div className="space-y-8">
          <VitrineKatas katas={katasFiltrados} />
          <KataTable
            titulo="Katas Básicos / Iniciantes"
            descricao="Série Heian e Tekki Shodan — a fundação técnica dos graus Kyu."
            katas={katasFiltrados.filter((kata) => kata.nivel === "basico")}
          />
          <KataTable
            titulo="Katas Intermediários"
            descricao="Sentei Kata — repertório obrigatório dos primeiros graus Dan."
            katas={katasFiltrados.filter(
              (kata) => kata.nivel === "intermediario",
            )}
          />
          <KataTable
            titulo="Katas Avançados"
            descricao="Tokui Kata — formas superiores, de escolha do praticante graduado."
            katas={katasFiltrados.filter((kata) => kata.nivel === "avancado")}
          />

          {katasFiltrados.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="body-muted">
                Nenhum kata nesta categoria. Selecione outro filtro.
              </p>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </>
  );
}
