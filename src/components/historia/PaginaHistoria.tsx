import Image from "next/image";
import { ArvoreGenealogica } from "@/components/historia/LineageTree";
import { FichasMestres } from "@/components/historia/FichasMestres";
import { LinhaDoTempo } from "@/components/historia/Timeline";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { AbasSecao } from "@/components/ui/AbasSecao";
import { SectionHeading } from "@/components/ui/Card";
import { historiaNoIdioma, TEXTOS_HISTORIA } from "@/i18n/historia";
import type { Idioma } from "@/i18n/idioma";

/** A mesma página serve /estudos/historia e /en/estudos/historia. */
export function PaginaHistoria({ idioma = "pt" }: { idioma?: Idioma }) {
  const t = TEXTOS_HISTORIA[idioma];
  const { timeline, mestres, preceitos, linhagens } = historiaNoIdioma(idioma);

  return (
    <>
      <HeroPagina
        sobretitulo={t.sobretitulo}
        titulo={t.titulo}
        imagem="/imagens/historia.webp"
        kanji="歴史"
        descricao={t.descricao(timeline.length, mestres.length)}
      />

      {/* A foto que se abre ao rolar, com o texto sobreposto a ela. */}
      <section className="section pt-10">
        <div className="hist-banner">
          <div className="hist-banner-foto expande">
            <Image src="/imagens/historia.webp" alt="" fill sizes="(min-width: 1120px) 1120px, 100vw" />
          </div>
          <div className="hist-banner-cartao" data-inclinar="4">
            <p className="eyebrow">{t.bannerSobretitulo}</p>
            <p className="mt-2 font-display text-2xl leading-snug text-heading">{t.bannerTexto}</p>
          </div>
        </div>
      </section>

      <div className="section py-10">
        <AbasSecao
          rotulo={t.rotuloAbas}
          abas={[
            {
              id: "linha",
              label: t.abaLinha,
              conteudo: (
                <div className="grid gap-6">
                  <SectionHeading eyebrow="Rekishi 歴史" titulo={t.linhaTitulo} descricao={t.linhaDescricao} />
                  <LinhaDoTempo marcos={timeline} />

                  {/* Os preceitos de Funakoshi como uma citação em destaque. */}
                  <figure className="hist-citacao">
                    <span className="hist-citacao-aspas" aria-hidden>
                      “
                    </span>
                    <figcaption className="eyebrow">{t.preceitosLegenda}</figcaption>
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
              label: t.abaLinhagem,
              conteudo: (
                <div className="grid gap-4">
                  <SectionHeading eyebrow="Keifu 系譜" titulo={t.linhagemTitulo} descricao={t.linhagemDescricao} />
                  <ArvoreGenealogica
                    raiz={linhagens.okinawa}
                    titulo={t.okinawaTitulo}
                    legenda={t.okinawaLegenda}
                    rodape={t.okinawaRodape}
                    idioma={idioma}
                  />
                  <ArvoreGenealogica
                    raiz={linhagens.japao}
                    titulo={t.japaoTitulo}
                    legenda={t.japaoLegenda}
                    rodape={t.japaoRodape}
                    idioma={idioma}
                  />
                </div>
              ),
            },
            {
              id: "mestres",
              label: t.abaMestres,
              conteudo: (
                <div className="grid gap-4">
                  <SectionHeading eyebrow="Sensei 先生" titulo={t.mestresTitulo} descricao={t.mestresDescricao} />
                  <FichasMestres mestres={mestres} idioma={idioma} />
                </div>
              ),
            },
            {
              id: "brasil",
              label: t.abaBrasil,
              conteudo: (
                <div className="grid gap-4">
                  <SectionHeading eyebrow="Burajiru 伯国" titulo={t.brasilTitulo} descricao={t.brasilDescricao} />
                  <ArvoreGenealogica
                    raiz={linhagens.brasil}
                    titulo={t.brasilArvoreTitulo}
                    legenda={t.brasilLegenda}
                    rodape={t.brasilRodape}
                    idioma={idioma}
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
