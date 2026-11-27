# Perguntas para o advogado

Torakan / Academia Tigre de Karatê. Lista montada em 27/11/2026 a partir das
auditorias de LGPD e de segurança e do plano de cobrança.

**Levar junto:**
- a política de privacidade (torakandojo.com/privacidade);
- os termos de uso (torakandojo.com/termos);
- os fatos do incidente (item 1).

---

## 1. Urgente: dados expostos na internet

**O que aconteceu.** De 06/09/2026 até o deploy da correção, um endereço do
site (`/api/academia`) devolvia, sem login, os dados de todos os alunos e
professores:
- nome, nome de usuário, e-mail e data de nascimento;
- foto e situação da mensalidade.

Eram **5 alunos, alguns menores de idade, e 3 professores**. Não há como saber
se alguém acessou: os registros da hospedagem guardam pouco tempo. O problema
foi achado por uma auditoria interna e corrigido em seguida.

- [ ] Precisamos comunicar à ANPD? (LGPD art. 48; Resolução CD/ANPD nº 15/2024.
      O prazo é de 3 dias úteis, em dobro para agente de pequeno porte.)
- [ ] Precisamos avisar os alunos e os pais? Com que texto e por qual meio?
- [ ] Como fazer o registro interno do incidente (ele precisa ficar guardado
      por 5 anos)? O que deve constar nele?
- [ ] O prazo conta a partir de quando: da descoberta (27/11) ou da correção?

## 2. Quem responde pelos dados

- [ ] O controlador é o Egnaldo, pessoa física, sem CNPJ. Isso está certo?
      Seria melhor ou obrigatório abrir MEI ou CNPJ, inclusive para receber
      pelo Stripe e pelo Mercado Pago e emitir recibo ou nota?
- [ ] Nos enquadramos como agente de pequeno porte (Resolução CD/ANPD nº 2/2022)?
- [ ] O Douglas aparece como encarregado. Isso precisa de algum documento de
      nomeação, já que ele não é o dono? Se estivermos dispensados, vale manter
      mesmo assim?
- [ ] Não publicamos o CPF do controlador, só o nome e o e-mail de privacidade.
      Isso basta?

## 3. Empresas que recebem os dados

Vercel (hospedagem), Neon (banco de dados), Cloudflare (verificação contra
robôs), Google (login, mapa e vídeos), Stripe e Mercado Pago (pagamentos).
Várias guardam dados fora do Brasil.

- [ ] Os termos padrão dessas empresas bastam como contrato com operador, ou
      precisamos de algo assinado?
- [ ] O que precisamos ter para a transferência internacional (art. 33;
      cláusulas-padrão da Resolução CD/ANPD nº 19/2024)?

## 4. Crianças e adolescentes

A academia tem alunos a partir de 7 anos. Hoje a equipe faz o cadastro a
pedido do responsável e registra o contato dele.

- [ ] Para o que exatamente precisamos do consentimento específico de um dos
      pais (art. 14 §1º)? Para o cadastro, que é contrato? Para a foto, o login
      com Google, o WhatsApp?
- [ ] Como registrar a prova desse consentimento: papel assinado, aceite no
      portal feito pelo responsável ou um campo no cadastro?
- [ ] Um adolescente (12 a 17 anos) pode aceitar sozinho os avisos por WhatsApp?
- [ ] Fotos e vídeos de alunos no site e nas redes: que autorização de uso de
      imagem precisamos dos pais?

## 5. Matrícula e contrato

- [ ] Precisamos de um contrato de matrícula escrito, ou os termos de uso do
      site bastam?
- [ ] Regras de cancelamento, aviso prévio e reembolso. Vale o direito de
      arrependimento de 7 dias (CDC art. 49) quando a matrícula começa pelo site?
- [ ] A "primeira semana grátis" precisa de regras escritas (sem compromisso,
      sem cobrança automática)?
- [ ] Termo de ciência dos riscos da prática esportiva e atestado médico: devemos
      pedir? Se guardarmos atestado, ele é dado de saúde (dado sensível, art. 11):
      como guardar? Hoje não coletamos.

## 6. Mensalidade: multa, juros e desconto

Os valores entram no sistema só depois da resposta.

| Assunto | Proposta | Pergunta |
|---|---|---|
| Multa por atraso | 2 % (teto do CDC, art. 52 §1º) | Pode? Incide sobre o valor com ou sem desconto? |
| Juros de mora | 1 % ao mês, por dia (≈ R$ 0,02/dia sobre R$ 70) | Simples e por dia está certo? Contam desde o vencimento? |
| Carência | 0 dias | Quantos dias antes de começar a multa? |
| Desconto por pagar em dia | No mês seguinte | Valor fixo ou %? Pode ser visto como multa disfarçada? |
| Começo das regras | Depois de avisar os alunos | Quanto tempo de aviso prévio? Precisa de aditivo ao contrato? |
| Vencimento no fim de semana | Passa para o dia útil seguinte | E os feriados? |

- [ ] Avisos de vencimento e de atraso: e-mail sem pedir consentimento (por ser
      execução de contrato) e WhatsApp só com consentimento. Está certo?
- [ ] Limites da cobrança (CDC art. 42): quantos avisos, em que horário? Para
      aluno menor, falar só com o responsável?
- [ ] Hoje a "mensalidade em dia" é um dos critérios do progresso para o exame
      de faixa, que o sistema calcula sozinho. Isso pode, inclusive para menores?
      (art. 20, decisões automatizadas)
- [ ] Podemos bloquear o portal ou o exame de faixa de quem está inadimplente?

## 7. Quanto tempo guardar

- [ ] Por quanto tempo guardar os registros de pagamento (prazo fiscal)?
- [ ] E os dados de ex-alunos? Podemos apagar ou anonimizar o resto quando a
      pessoa sai?
- [ ] O Marco Civil (art. 15) manda guardar registros de acesso por 6 meses.
      Isso vale para nós, pessoa física sem CNPJ? Hoje as tentativas de login
      são apagadas depois de 1 dia, e o site não guarda registros de acesso
      próprios.

## 8. Revisão dos textos

- [ ] Revisar a política de privacidade e os termos de uso publicados.
- [ ] As bases legais estão certas? Contrato para o portal, obrigação legal para
      pagamentos, consentimento para WhatsApp e Google, legítimo interesse para
      segurança e contagem de visitas.
