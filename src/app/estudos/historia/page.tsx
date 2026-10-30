import type { Metadata } from "next";
import {
  ArvoreGenealogica,
  LINHAGEM_BRASIL,
  LINHAGEM_JAPAO,
  LINHAGEM_OKINAWA,
} from "@/components/historia/LineageTree";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { FichasMestres } from "@/components/historia/FichasMestres";
import { LinhaDoTempo } from "@/components/historia/Timeline";
import Image from "next/image";
import { AbasSecao } from "@/components/ui/AbasSecao";
import { SectionHeading } from "@/components/ui/Card";
import {
  getMestres,
  getPreceitosFunakoshi,
  getTimeline,
} from "@/services/dataService";

export const metadata: Metadata = {
  title: "História",
  description:
    "Linha do tempo do Karatê Shotokan e a árvore genealógica dos mestres.",
};

export default function HistoriaPage() {
  const timeline = getTimeline();
  const mestres = getMestres();
  const preceitos = getPreceitosFunakoshi();

  return (
    <>
      <HeroPagina
        sobretitulo="História · 歴史"
        titulo="De Okinawa ao mundo: a linhagem do Shotokan"
        imagem="/imagens/historia.jpg"
        kanji="歴史"
        descricao={
          <>
            {timeline.length} marcos históricos e {mestres.length} mestres
            catalogados. Conhecer essa trajetória muda a forma como se executa
            cada kata.
          </>
        }
      />

      {/* A foto que se abre ao rolar, com o texto sobreposto a ela. */}
      <section className="section pt-10">
        <div className="hist-banner">
          <div className="hist-banner-foto expande">
            <Image src="/imagens/historia.jpg" alt="" fill sizes="(min-width: 1120px) 1120px, 100vw" />
          </div>
          <div className="hist-banner-cartao" data-inclinar="4">
            <p className="eyebrow">Do castelo de Shuri ao mundo</p>
            <p className="mt-2 font-display text-2xl leading-snug text-heading">
              Um professor primário de Okinawa levou a arte ao Japão em 1922. Cem anos depois, ela se treina
              em todos os continentes — e cada kata ainda carrega o nome de quem o guardou.
            </p>
          </div>
        </div>
      </section>

      <div className="section py-10">
        <AbasSecao
          rotulo="Tópicos de História"
          abas={[
            {
              id: "linha",
              label: "Linha do tempo",
              conteudo: (
                <div className="grid gap-6">
                  <SectionHeading
                    eyebrow="Rekishi 歴史"
                    titulo="Linha do tempo"
                    descricao="Clique em um marco para abrir o contexto histórico completo."
                  />
                  <LinhaDoTempo marcos={timeline} />

                  {/* Os preceitos de Funakoshi como uma citação em destaque. */}
                  <figure className="hist-citacao">
                    <span className="hist-citacao-aspas" aria-hidden>
                      “
                    </span>
                    <figcaption className="eyebrow">Preceitos de Gichin Funakoshi</figcaption>
                    <ul className="mt-3 grid gap-3 md:grid-cols-3">
                      {preceitos.map((preceito) => (
                        <li key={preceito} className="font-display text-lg leading-snug text-heading">
                          {preceito}
                        </li>
                      ))}
                    </ul>
                  </figure>
                </div>
              ),
            },
            {
              id: "linhagem",
              label: "Linhagem",
              conteudo: (
                <div className="grid gap-4">
                  <SectionHeading
                    eyebrow="Keifu 系譜"
                    titulo="A linhagem, do Japão ao mundo"
                    descricao="A sucessão de mestres que levou a arte de Shuri aos dojos contemporâneos. Em recortes, porque uma árvore só chegava a cinco níveis de recuo e ninguém conseguia seguir quem vinha de quem."
                  />
                  <ArvoreGenealogica
                    raiz={LINHAGEM_OKINAWA}
                    titulo="1 · As raízes em Okinawa"
                    legenda="Séculos XIX e XX"
                    rodape="Asato e Itosu formaram Funakoshi em conjunto — não é uma linha única. A árvore os mostra lado a lado, e a descendência segue por Itosu apenas para manter a leitura vertical."
                  />
                  <ArvoreGenealogica
                    raiz={LINHAGEM_JAPAO}
                    titulo="2 · Do fundador ao mundo"
                    legenda="Os discípulos diretos e onde cada um plantou"
                    rodape="Todos os nomes deste nível treinaram diretamente com Funakoshi. As organizações entre parênteses foram fundadas por eles depois — várias nasceram de discordâncias sobre o rumo esportivo do estilo."
                  />
                </div>
              ),
            },
            {
              id: "mestres",
              label: "Mestres",
              conteudo: (
                <div className="grid gap-4">
                  <SectionHeading
                    eyebrow="Sensei 先生"
                    titulo="Fichas dos mestres"
                    descricao="Quem foi cada um, quando viveu e o que deixou para o estilo."
                  />
                  <FichasMestres mestres={mestres} />
                </div>
              ),
            },
            {
              id: "brasil",
              label: "No Brasil",
              conteudo: (
                <div className="grid gap-4">
                  <SectionHeading
                    eyebrow="Burajiru 伯国"
                    titulo="Chegada ao Brasil"
                    descricao="Entre 1955 e 1972, mestres japoneses desembarcam em ondas e fundam as linhagens de onde descende a maior parte do Shotokan brasileiro — de Harada, que veio trabalhar num banco, a Okuda, enviado oficialmente pela JKA."
                  />
                  <ArvoreGenealogica
                    raiz={LINHAGEM_BRASIL}
                    titulo="3 · Ramificações no Brasil"
                    legenda="1955 a 1972"
                    rodape="Datas e cidades conferidas em fontes independentes. Existem outras linhagens importantes além destas — a primeira geração chegou em grupo, e nem todos os nomes ficaram registrados."
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
