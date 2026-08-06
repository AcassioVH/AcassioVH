import type { Metadata } from "next";

import {
  ControllerIdentification,
  LegalList,
  LegalSection,
  LegalTitle,
  PendingLegalReviewNotice,
} from "@/components/ui/LegalProse";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "A Acássium Invest não coleta dados pessoais. Este site é conteúdo educativo estático.",
};

/**
 * Política de Privacidade — LGPD.
 *
 * Ficou curta porque o site ficou simples: não há cadastro, não há banco de
 * dados e não há formulário. A política mais forte é a que pode dizer "não
 * coletamos" e ser verificável — e esta pode, porque não existe servidor
 * guardando nada.
 *
 * Se um dia entrar formulário, newsletter ou análise de audiência, este texto
 * precisa mudar no mesmo commit.
 */
export default function PrivacyPage() {
  return (
    <>
      <LegalTitle>Política de Privacidade</LegalTitle>
      <p className="mt-4 text-lg text-aux">
        Como a Acássium Invest trata os seus dados pessoais, conforme a Lei nº 13.709/2018
        (LGPD).
      </p>

      <PendingLegalReviewNotice />

      <LegalSection title="1. O resumo">
        <p className="text-title">
          Este site não coleta dados pessoais. Não há cadastro, não há login, não há
          formulário e não há banco de dados.
        </p>
        <p>
          É conteúdo educativo publicado como páginas estáticas. Você lê e vai embora, e
          nada seu fica aqui.
        </p>
      </LegalSection>

      <LegalSection title="2. Quem responde por este site">
        <p>
          O controlador é <ControllerIdentification />.
        </p>
        <p>
          Para qualquer assunto relativo a dados pessoais, o contato é{" "}
          <a
            href={`mailto:${site.contact.email}`}
            className="text-light underline-offset-4 hover:underline"
          >
            {site.contact.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="3. O que não fazemos">
        <LegalList
          items={[
            "Não pedimos nome, e-mail, telefone, CPF nem qualquer informação sua.",
            "Não usamos cookies de rastreamento nem ferramentas de análise de audiência.",
            "Não montamos perfil de navegação e não fazemos publicidade direcionada.",
            "Não vendemos, cedemos nem compartilhamos dado nenhum — porque não temos dado nenhum.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Registros técnicos do servidor">
        <p>
          Como qualquer site na internet, o serviço de hospedagem registra dados técnicos
          das requisições — endereço IP, data e hora, e o navegador usado. Isso é
          necessário para o site funcionar e para proteger a infraestrutura contra abuso.
        </p>
        <p>
          Esses registros ficam com o provedor de hospedagem, sob a política dele, e não
          são usados por nós para identificar, contatar ou perfilar visitantes.
        </p>
      </LegalSection>

      <LegalSection title="5. Quando você clica no WhatsApp">
        <p>
          O botão de contato abre uma conversa no WhatsApp com o assessor. A partir daí, a
          conversa acontece dentro do WhatsApp e passa a ser regida pela política de
          privacidade da Meta, não por esta.
        </p>
        <p>
          O que você escolher contar nessa conversa é tratado como atendimento de
          assessoria, sob a regulamentação aplicável à atividade e à instituição a que o
          profissional está vinculado.
        </p>
      </LegalSection>

      <LegalSection title="6. Links para fontes oficiais">
        <p>
          Os verbetes apontam para sites de terceiros — CVM, B3, FGC, Receita Federal,
          Tesouro Direto, ANBIMA, SUSEP. Ao seguir esses links você sai daqui, e o
          tratamento dos seus dados passa a ser o daquele site.
        </p>
      </LegalSection>

      <LegalSection title="7. Seus direitos">
        <p>
          A LGPD garante a você acesso, correção, portabilidade e eliminação dos seus dados
          pessoais. Como não coletamos nenhum, não há o que acessar, corrigir ou apagar
          aqui.
        </p>
        <p>
          Se ainda assim quiser confirmar isso, escreva para o e-mail acima e
          responderemos no prazo legal.
        </p>
      </LegalSection>

      <LegalSection title="8. Alterações">
        <p>
          Se o site passar a coletar qualquer dado — um formulário, uma lista de e-mails,
          uma ferramenta de audiência —, esta política será atualizada antes de a coleta
          começar, e a data de revisão no rodapé mudará junto.
        </p>
      </LegalSection>
    </>
  );
}
