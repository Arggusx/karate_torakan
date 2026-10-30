import type { Metadata } from "next";
import Link from "next/link";
import { Contato, PaginaLegal } from "@/components/legal/PaginaLegal";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "As regras para usar o site, o portal de estudos e o portal da Academia Tigre de Karatê.",
};

export default function TermosPage() {
  return (
    <PaginaLegal
      sobretitulo="Termos · 約束"
      titulo="Termos de Uso"
      descricao="As regras do site e do portal, como as regras de etiqueta do dojo: poucas, claras e para que todos treinem bem."
      outra={{ href: "/privacidade", rotulo: "Ler a Política de Privacidade" }}
      secoes={[
        {
          id: "aceite",
          titulo: "Sobre estes termos",
          conteudo: (
            <p>
              Estes termos valem para o site Torakan, o portal de estudos e o portal de alunos e equipe da
              Academia Tigre de Karatê. Ao usar o portal, você concorda com eles e com a{" "}
              <Link href="/privacidade">Política de Privacidade</Link>. Se o aluno for menor de idade, o
              responsável concorda em nome dele.
            </p>
          ),
        },
        {
          id: "servico",
          titulo: "O que o Torakan oferece",
          conteudo: (
            <ul>
              <li>Conteúdo de estudo sobre o Karatê Shotokan, aberto a qualquer pessoa.</li>
              <li>Jogos de estudo (Jornada), sem pontuação de ranking e sem coleta de dados.</li>
              <li>
                Portal para alunos matriculados, professores e administração: turmas, chamada, mensalidades,
                provas e conta.
              </li>
            </ul>
          ),
        },
        {
          id: "conta",
          titulo: "Sua conta",
          conteudo: (
            <>
              <p>
                As contas do portal são criadas pela equipe da academia; não existe cadastro aberto. Você é
                responsável por manter sua senha em segredo e por quem usa a sua conta.
              </p>
              <p>
                O login com Google é opcional e só entra numa conta que você mesmo vinculou depois de entrar com
                usuário e senha. Você pode desvincular quando quiser em “Minha conta”.
              </p>
            </>
          ),
        },
        {
          id: "uso",
          titulo: "Uso correto",
          conteudo: (
            <>
              <p>Ao usar o portal, você se compromete a não:</p>
              <ul>
                <li>entrar na conta de outra pessoa ou tentar ver dados que não são seus;</li>
                <li>tentar burlar provas, a correção ou a segurança do sistema;</li>
                <li>enviar fotos ofensivas ou que não sejam suas;</li>
                <li>usar o site para qualquer fim ilegal.</li>
              </ul>
              <p>A academia pode suspender o acesso de quem descumprir estas regras.</p>
            </>
          ),
        },
        {
          id: "provas",
          titulo: "Provas teóricas",
          conteudo: (
            <p>
              As provas do portal avaliam o conhecimento teórico e são liberadas pelo professor. Elas não
              substituem o exame de faixa no tatame, que continua sendo decidido pelo sensei. A graduação depende
              também de técnica, tempo de treino e frequência.
            </p>
          ),
        },
        {
          id: "pagamentos",
          titulo: "Mensalidades e pagamentos",
          conteudo: (
            <p>
              Valores, vencimento e condições estão na página de <Link href="/planos">Planos</Link> e no
              contrato de matrícula. Os pagamentos online são processados pelo Stripe ou pelo Mercado Pago, sob
              os termos deles. Dúvidas ou estornos: fale <Contato />.
            </p>
          ),
        },
        {
          id: "conteudo",
          titulo: "Conteúdo e direitos",
          conteudo: (
            <p>
              Textos, organização do acervo, ilustrações e a marca Torakan pertencem à Academia Tigre de Karatê,
              salvo indicação de outra fonte (como o cartaz da ISO citado nos Fundamentos). Você pode usar o
              conteúdo para estudo pessoal; reproduzir ou publicar exige autorização.
            </p>
          ),
        },
        {
          id: "seguranca-treino",
          titulo: "Treino e segurança",
          conteudo: (
            <p>
              O conteúdo de estudo é complementar às aulas e não substitui a orientação de um professor. Não
              pratique técnicas de impacto ou de projeção sem supervisão.
            </p>
          ),
        },
        {
          id: "disponibilidade",
          titulo: "Disponibilidade",
          conteudo: (
            <p>
              Fazemos o possível para o site estar no ar, mas ele pode ficar fora em manutenções ou falhas. O
              conteúdo pode mudar a qualquer momento.
            </p>
          ),
        },
        {
          id: "mudancas",
          titulo: "Mudanças e foro",
          conteudo: (
            <>
              <p>
                Estes termos podem ser atualizados; a data no índice indica a versão em vigor. Eles seguem as
                leis brasileiras.
              </p>
              <p>
                Dúvidas: fale <Contato />.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
