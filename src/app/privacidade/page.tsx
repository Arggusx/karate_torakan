import type { Metadata } from "next";
import { Contato, PaginaLegal } from "@/components/legal/PaginaLegal";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Quais dados o Torakan coleta, para que usa, com quem compartilha e como exercer seus direitos pela LGPD.",
};

export default function PrivacidadePage() {
  return (
    <PaginaLegal
      sobretitulo="Privacidade · LGPD"
      titulo="Política de Privacidade"
      descricao="Em linguagem simples: o que guardamos sobre você, para quê, com quem dividimos e como pedir para ver, corrigir ou apagar."
      outra={{ href: "/termos", rotulo: "Ler os Termos de Uso" }}
      secoes={[
        {
          id: "quem",
          titulo: "Quem somos",
          conteudo: (
            <p>
              O Torakan (虎館) é o site e o portal da Academia Tigre de Karatê. A academia é a responsável
              (controladora, nos termos da Lei Geral de Proteção de Dados — Lei nº 13.709/2018) pelos dados
              tratados aqui. Para qualquer assunto de privacidade, fale <Contato />.
            </p>
          ),
        },
        {
          id: "dados",
          titulo: "Quais dados coletamos",
          conteudo: (
            <>
              <p>O site público e o portal de estudos podem ser usados sem conta e sem cadastro. No portal da academia, guardamos:</p>
              <ul>
                <li>
                  <strong>Cadastro</strong>, feito pela equipe da academia: nome, nome de usuário, e-mail (do
                  aluno ou do responsável), data de nascimento, turma e faixa.
                </li>
                <li>
                  <strong>Vida no dojo</strong>: presença nas aulas, situação da mensalidade, histórico de
                  graduação e resultado das provas teóricas.
                </li>
                <li>
                  <strong>Foto de perfil</strong>, se você enviar uma.
                </li>
                <li>
                  <strong>Conta Google</strong>, só se você escolher vinculá-la: o identificador da conta, o
                  e-mail e a foto do perfil Google.
                </li>
                <li>
                  <strong>Senha</strong>, guardada apenas como hash (bcrypt) — nem a equipe consegue lê-la.
                </li>
              </ul>
              <p>
                Pagamentos são feitos nas páginas do Stripe ou do Mercado Pago. Os dados do cartão vão direto
                para eles; nós recebemos apenas a confirmação do pagamento.
              </p>
            </>
          ),
        },
        {
          id: "google",
          titulo: "Login com Google",
          conteudo: (
            <>
              <p>
                O login com Google é opcional e só funciona numa conta que já existe na academia. Pedimos ao
                Google apenas o básico: <strong>nome, e-mail e foto de perfil</strong> (escopos
                “openid”, “email” e “profile”). Usamos isso somente para reconhecer você no login e, se você
                ainda não tiver foto, mostrar a do Google no portal. Não acessamos Gmail, Drive, contatos nem
                nenhum outro dado da sua conta.
              </p>
              <p>
                O uso e a transferência das informações recebidas das APIs do Google seguem a{" "}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
                  Política de Dados do Usuário dos Serviços de API do Google
                </a>
                , incluindo os requisitos de Uso Limitado. Não vendemos esses dados, não os usamos para
                publicidade e não os repassamos a ninguém. Você pode desvincular o Google a qualquer momento em
                “Minha conta”.
              </p>
            </>
          ),
        },
        {
          id: "para-que",
          titulo: "Para que usamos",
          conteudo: (
            <ul>
              <li>Dar acesso ao portal e manter você conectado com segurança.</li>
              <li>Organizar turmas, chamada, mensalidades e exames de faixa.</li>
              <li>Aplicar e corrigir as provas teóricas liberadas pelo professor.</li>
              <li>Cumprir obrigações legais e fiscais da academia.</li>
            </ul>
          ),
        },
        {
          id: "compartilhamento",
          titulo: "Com quem compartilhamos",
          conteudo: (
            <>
              <p>Não vendemos dados. Eles passam apenas pelos serviços que fazem o site funcionar:</p>
              <ul>
                <li>
                  <strong>Vercel</strong> — hospedagem do site.
                </li>
                <li>
                  <strong>Neon</strong> — banco de dados onde o cadastro fica guardado.
                </li>
                <li>
                  <strong>Google</strong> — somente se você usar o login com Google.
                </li>
                <li>
                  <strong>Stripe e Mercado Pago</strong> — somente para processar pagamentos.
                </li>
              </ul>
              <p>Esses serviços podem guardar dados fora do Brasil, com as proteções previstas na LGPD.</p>
            </>
          ),
        },
        {
          id: "aparelho",
          titulo: "Cookies e dados no seu aparelho",
          conteudo: (
            <>
              <p>
                Usamos um único cookie, necessário para manter a sessão do portal (assinado e inacessível a
                scripts da página). Não usamos cookies de publicidade nem de rastreamento.
              </p>
              <p>
                Algumas coisas ficam só no seu navegador (armazenamento local) e nunca vão para o servidor: o
                progresso nos jogos da Jornada, as respostas de uma prova ainda não entregue e preferências como
                tema claro ou escuro.
              </p>
            </>
          ),
        },
        {
          id: "menores",
          titulo: "Crianças e adolescentes",
          conteudo: (
            <p>
              A academia tem alunos a partir de 7 anos. O cadastro de menores é feito pela equipe com o
              consentimento de um dos pais ou responsável, que pode exercer todos os direitos desta política em
              nome do aluno. Tratamos apenas o necessário para as aulas.
            </p>
          ),
        },
        {
          id: "guarda",
          titulo: "Por quanto tempo guardamos",
          conteudo: (
            <p>
              Enquanto você for aluno ou fizer parte da equipe. Depois do desligamento, os dados são apagados ou
              anonimizados, exceto o que a lei obriga a guardar (por exemplo, registros de pagamento).
            </p>
          ),
        },
        {
          id: "direitos",
          titulo: "Seus direitos",
          conteudo: (
            <>
              <p>Pela LGPD, você (ou seu responsável) pode pedir a qualquer momento:</p>
              <ul>
                <li>confirmação de que tratamos seus dados e acesso a eles;</li>
                <li>correção de dados incompletos ou errados;</li>
                <li>exclusão, anonimização ou bloqueio do que não for necessário;</li>
                <li>informação sobre com quem compartilhamos;</li>
                <li>revogação do consentimento, como desvincular a conta Google.</li>
              </ul>
              <p>
                Foto, usuário, senha e vínculo com o Google você mesmo muda em “Minha conta”. Para o resto, fale{" "}
                <Contato />. Você também pode recorrer à Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
            </>
          ),
        },
        {
          id: "seguranca",
          titulo: "Segurança",
          conteudo: (
            <p>
              O site só funciona por conexão segura (HTTPS), as senhas são guardadas com hash, a sessão é
              assinada e cada perfil (aluno, professor, administração) só vê o que precisa. Nenhum sistema é
              invulnerável; se houver um incidente que afete você, avisaremos.
            </p>
          ),
        },
        {
          id: "mudancas",
          titulo: "Mudanças nesta política",
          conteudo: (
            <p>
              Quando esta política mudar, a data no início da página é atualizada. Mudanças importantes serão
              avisadas no portal.
            </p>
          ),
        },
      ]}
    />
  );
}
