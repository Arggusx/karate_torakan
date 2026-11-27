import type { Metadata } from "next";
import { CONTROLADOR, Contato, ENCARREGADO, PaginaLegal } from "@/components/legal/PaginaLegal";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Quais dados o Torakan coleta, para que usa, com quem compartilha e como exercer seus direitos pela LGPD.",
  alternates: { canonical: "/privacidade" },
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
            <>
              <p>
                O Torakan (虎館) é o site e o portal da Academia Tigre de Karatê
                {CONTROLADOR ? ` (${CONTROLADOR.nome}, ${CONTROLADOR.documento})` : ""}, Rua 15 de Novembro,
                1104, Centro, Olho d’Água das Flores – AL. A academia é a responsável (controladora, nos
                termos da Lei Geral de Proteção de Dados — Lei nº 13.709/2018) pelos dados tratados aqui.
              </p>
              <p>
                {ENCARREGADO
                  ? `O encarregado pelo tratamento de dados é ${ENCARREGADO}. `
                  : "A pessoa responsável por atender pedidos sobre dados pessoais é a direção da academia. "}
                Para qualquer assunto de privacidade, fale <Contato />.
              </p>
            </>
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
                  <strong>Cadastro</strong>, feito pela equipe da academia: nome, nome de usuário, e-mail,
                  telefone, data de nascimento, turma e faixa.
                </li>
                <li>
                  <strong>Responsável</strong>, para alunos menores de idade: nome, parentesco, telefone e
                  e-mail de um dos pais ou responsável.
                </li>
                <li>
                  <strong>Aceite de avisos por WhatsApp</strong>, se você (ou o responsável) marcar: a escolha,
                  a data e quem aceitou.
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
                <li>
                  <strong>Tentativas de login</strong>: o usuário tentado, a data e o endereço IP
                  embaralhado (hash), para bloquear quem tenta adivinhar senhas. Só contam pelos 15 minutos
                  seguintes e são apagadas depois de um dia.
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
          titulo: "Para que usamos e com qual base legal",
          conteudo: (
            <ul>
              <li>
                <strong>Dar acesso ao portal, organizar turmas, chamada, mensalidades e exames de faixa,
                e aplicar as provas teóricas</strong> — para cumprir o contrato de matrícula (art. 7º, V).
              </li>
              <li>
                <strong>Guardar registros de pagamento</strong> — para cumprir obrigações legais e fiscais
                (art. 7º, II).
              </li>
              <li>
                <strong>Avisos pelo WhatsApp</strong> — só com o seu consentimento (ou o do responsável),
                que pode ser retirado a qualquer momento em “Minha conta” (art. 7º, I).
              </li>
              <li>
                <strong>Login com Google e foto de perfil</strong> — com o seu consentimento, ao escolher
                usar (art. 7º, I).
              </li>
              <li>
                <strong>Proteger as contas</strong> (limite de tentativas de login e verificação contra
                robôs) e <strong>medir visitas ao site</strong> de forma agregada — legítimo interesse da
                academia em manter o site seguro e funcionando (art. 7º, IX).
              </li>
            </ul>
          ),
        },
        {
          id: "automaticas",
          titulo: "Decisões automáticas",
          conteudo: (
            <>
              <p>Duas coisas no portal são calculadas pelo sistema:</p>
              <ul>
                <li>
                  <strong>Progresso para o próximo exame</strong>: soma quatro critérios — técnicas do
                  programa marcadas pelo sensei, tempo mínimo na faixa, aulas assistidas e mensalidade em
                  dia — e indica se o aluno está apto. É uma referência: quem decide o exame de faixa é o
                  sensei.
                </li>
                <li>
                  <strong>Correção das provas teóricas</strong>: as respostas são comparadas com o gabarito e
                  o resultado sai na hora, com a correção de cada questão.
                </li>
              </ul>
              <p>
                Se achar que algum resultado está errado, peça ao sensei para revisar, ou fale <Contato />.
              </p>
            </>
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
                  <strong>Vercel</strong> — hospedagem do site e contagem de visitas (sem cookies e sem
                  identificar quem visita).
                </li>
                <li>
                  <strong>Neon</strong> — banco de dados onde o cadastro fica guardado.
                </li>
                <li>
                  <strong>Cloudflare (Turnstile)</strong> — verificação contra robôs na tela de login; recebe
                  dados técnicos do navegador e o endereço IP.
                </li>
                <li>
                  <strong>Google</strong> — somente se você usar o login com Google, abrir o mapa da academia
                  ou assistir a um vídeo de kata (YouTube). O mapa e os vídeos só carregam depois que você
                  clica neles.
                </li>
                <li>
                  <strong>Stripe e Mercado Pago</strong> — somente para processar pagamentos.
                </li>
              </ul>
              <p>
                Vercel, Neon, Cloudflare, Google e Stripe podem guardar dados fora do Brasil (por exemplo, nos
                Estados Unidos), com as proteções previstas na LGPD para transferência internacional.
              </p>
            </>
          ),
        },
        {
          id: "aparelho",
          titulo: "Cookies e dados no seu aparelho",
          conteudo: (
            <>
              <p>
                Usamos um único cookie nosso, necessário para manter a sessão do portal (assinado e
                inacessível a scripts da página). Não usamos cookies de publicidade nem de rastreamento.
                Mapa e vídeos do Google podem gravar cookies deles, mas só depois que você clica para abrir.
              </p>
              <p>
                Algumas coisas ficam só no seu navegador (armazenamento local) e não vão para o servidor: as
                respostas de uma prova ainda não entregue e preferências como tema claro ou escuro.
              </p>
            </>
          ),
        },
        {
          id: "menores",
          titulo: "Crianças e adolescentes",
          conteudo: (
            <p>
              A academia tem alunos a partir de 7 anos. O cadastro de menores é feito pela equipe a pedido de
              um dos pais ou responsável, cujo contato fica registrado no cadastro. É o responsável quem
              recebe os avisos e quem decide sobre o WhatsApp, e pode exercer todos os direitos desta
              política em nome do aluno. Tratamos apenas o necessário para as aulas e nunca usamos dados de
              alunos para publicidade.
            </p>
          ),
        },
        {
          id: "guarda",
          titulo: "Por quanto tempo guardamos",
          conteudo: (
            <>
              <p>
                Enquanto você for aluno ou fizer parte da equipe. No desligamento, a conta é desativada e deixa
                de ter acesso. A pedido, apagamos ou anonimizamos os dados, exceto o que a lei obriga a guardar
                (registros de pagamento, pelo prazo fiscal).
              </p>
              <p>
                As tentativas de login com mais de um dia são apagadas automaticamente, na próxima vez que
                alguém entra no portal.
              </p>
            </>
          ),
        },
        {
          id: "direitos",
          titulo: "Seus direitos",
          conteudo: (
            <>
              <p>Pela LGPD (art. 18), você (ou seu responsável) pode pedir a qualquer momento:</p>
              <ul>
                <li>confirmação de que tratamos seus dados e acesso a eles;</li>
                <li>correção de dados incompletos ou errados;</li>
                <li>exclusão, anonimização ou bloqueio do que não for necessário;</li>
                <li>uma cópia dos seus dados para levar a outro serviço (portabilidade);</li>
                <li>informação sobre com quem compartilhamos;</li>
                <li>
                  informação sobre o que acontece se você não consentir — por exemplo, sem o aceite do
                  WhatsApp os avisos chegam por outros canais, e nada mais muda;
                </li>
                <li>revogação do consentimento, como retirar o aceite do WhatsApp ou desvincular o Google;</li>
                <li>oposição a um tratamento baseado em legítimo interesse;</li>
                <li>revisão de um resultado calculado automaticamente.</li>
              </ul>
              <p>
                Foto, usuário, senha, telefone, contato do responsável, aceite do WhatsApp e vínculo com o
                Google você mesmo muda em “Minha conta”. Para o resto, fale <Contato />. Você também pode
                recorrer à Autoridade Nacional de Proteção de Dados (ANPD).
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
              assinada, o login tem limite de tentativas e verificação contra robôs, e cada perfil (aluno,
              professor, administração) só vê o que precisa. Nenhum sistema é invulnerável; se houver um
              incidente que possa afetar você, avisaremos você e a ANPD.
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
