import { naAcademy } from "@/lib/enderecos";
import type { KataCompleto } from "@/types";

/**
 * Dados estruturados (schema.org) da página de um kata: um recurso de estudo
 * (LearningResource) e o caminho até ele (BreadcrumbList). Ajuda buscadores
 * comuns e os com IA a entender e citar a página.
 */
export function DadosKata({ kata, idioma }: { kata: KataCompleto; idioma: "pt-BR" | "en" }) {
  const en = idioma === "en";
  const base = en ? "/en/estudos" : "/estudos";
  const url = (caminho: string) => naAcademy(caminho) || undefined;
  const nivel = { basico: en ? "Beginner" : "Iniciante", intermediario: en ? "Intermediate" : "Intermediário", avancado: en ? "Advanced" : "Avançado" }[kata.nivel];

  const dados = [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: `${kata.nome}${kata.kanji ? ` (${kata.kanji})` : ""}`,
      alternateName: kata.significadoNome,
      description: kata.resumo?.text ?? kata.tecnicasDestaque,
      inLanguage: idioma,
      learningResourceType: en ? "Kata study sheet" : "Ficha de estudo de kata",
      educationalLevel: nivel,
      about: { "@type": "Thing", name: en ? "Shotokan Karate" : "Karatê Shotokan" },
      url: url(`${base}/tecnicas/kata/${kata.id}`),
      provider: {
        "@type": "SportsActivityLocation",
        name: "Academia Tigre de Karatê",
        alternateName: "Torakan",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: en ? "Study" : "Estudos", item: url(base) },
        { "@type": "ListItem", position: 2, name: en ? "Techniques" : "Técnicas", item: url(`${base}/tecnicas`) },
        { "@type": "ListItem", position: 3, name: kata.nome, item: url(`${base}/tecnicas/kata/${kata.id}`) },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Só dados do acervo (fixos), nunca texto de usuário. O replace impede
      // que um "</script>" no meio do texto feche a tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }}
    />
  );
}
