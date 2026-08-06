import "server-only";

/**
 * Envio de e-mail transacional.
 *
 * A interface existe para que o fluxo de recuperação de senha esteja completo e
 * testável antes de haver conta em provedor nenhum. Sem `RESEND_API_KEY`, o
 * e-mail é escrito no log do servidor com o link inteiro — em desenvolvimento
 * isso basta para percorrer o fluxo do começo ao fim.
 *
 * Em produção a ausência da chave é tratada como erro, e não como silêncio:
 * um sistema que aceita "esqueci minha senha" e não envia nada é pior que um
 * que recusa o pedido, porque o usuário fica esperando.
 */

export type Email = {
  readonly to: string;
  readonly subject: string;
  /** Corpo em texto puro. Sem HTML: menos superfície e melhor entregabilidade. */
  readonly text: string;
};

export type SendResult = { readonly delivered: boolean; readonly via: string };

const FROM = process.env.EMAIL_FROM ?? "Acássium Invest <nao-responda@acassium.com.br>";

async function sendViaResend(email: Email, apiKey: string): Promise<SendResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [email.to],
      subject: email.subject,
      text: email.text,
    }),
  });

  if (!response.ok) {
    // O corpo do erro do provedor não repete o endereço, então é seguro logar.
    const detail = await response.text().catch(() => "");
    throw new Error(`Falha ao enviar e-mail (${response.status}): ${detail.slice(0, 200)}`);
  }

  return { delivered: true, via: "resend" };
}

/**
 * Registra o e-mail no log, para desenvolvimento.
 *
 * Escreve o corpo inteiro — inclusive o link com o token. É aceitável porque só
 * roda fora de produção; em produção este caminho lança antes de chegar aqui.
 */
function logToConsole(email: Email): SendResult {
  console.info(
    [
      "",
      "─".repeat(72),
      "E-MAIL NÃO ENVIADO — RESEND_API_KEY ausente. Conteúdo abaixo:",
      `Para:     ${email.to}`,
      `Assunto:  ${email.subject}`,
      "",
      email.text,
      "─".repeat(72),
      "",
    ].join("\n"),
  );

  return { delivered: false, via: "console" };
}

export async function sendEmail(email: Email): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) return sendViaResend(email, apiKey);

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "RESEND_API_KEY não configurada em produção. O envio de e-mail é obrigatório " +
        "para a recuperação de senha funcionar.",
    );
  }

  return logToConsole(email);
}
