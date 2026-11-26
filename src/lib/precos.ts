/**
 * Mensalidade mostrada na landing e na página de planos.
 *
 * Fica escrita aqui, e não lida de VALOR_MENSALIDADE_CENTAVOS, para a vitrine
 * não mudar junto com um valor de teste no .env. A cobrança de verdade (PIX,
 * cartão, cron das mensalidades) usa a variável de ambiente: ao mudar o preço,
 * mude os dois.
 */
export const MENSALIDADE = "R$ 70";
