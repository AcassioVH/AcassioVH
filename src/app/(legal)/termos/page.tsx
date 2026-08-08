import type { Metadata } from "next";
import Link from "next/link";

import {
  ControllerIdentification,
  LegalList,
  LegalSection,
  LegalTitle,
  PendingLegalReviewNotice,
} from "@/components/ui/LegalProse";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "O que a Acássium Invest publica, o que não faz, e sob quais condições.",
};

export default function TermsPage() {
  return (
    <>
      <LegalTitle>Termos de Uso</LegalTitle>
      <p className="mt-4 text-lg text-aux">
        As condições de uso deste site. Ao navegar por ele, você concorda com o que está
        aqui.
      </p>

      <PendingLegalReviewNotice />

      <LegalSection title="1. O que este site é">
        <p>
          A Acássium Invest, mantida por <ControllerIdentification />, publica conteúdo
          educativo sobre produtos de investimento disponíveis no mercado brasileiro.
        </p>
        <p>Cada verbete descreve, para um tipo de produto:</p>
        <LegalList
          items={[
            "O que ele é e quem o emite.",
            "De onde vem o dinheiro que paga o investidor.",
            "Como funciona o resgate ou a negociação.",
            "Qual a regra tributária vigente aplicável.",
            "Qual a estrutura de garantia, incluindo a cobertura do FGC quando houver.",
            "Onde conferir cada dado na fonte oficial.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. O que este site não é">
        <p className="text-title">
          Esta é a cláusula mais importante, e ela define o serviço inteiro.
        </p>
        <p>
          A Acássium Invest não presta consultoria, análise ou recomendação de valores
          mobiliários. O conteúdo é educativo e descritivo. Especificamente, este site:
        </p>
        <LegalList
          items={[
            "Não indica o que comprar, manter ou vender.",
            "Não qualifica produto como bom ou ruim, nem adequado ao seu perfil.",
            "Não calcula, projeta nem afirma rentabilidade de qualquer produto.",
            "Não ordena, pontua nem classifica produtos por mérito.",
            "Não executa ordens, não custodia valores e não movimenta recursos.",
          ]}
        />
        <p>
          A comparação de estruturas oferecida no site coloca características verificáveis
          lado a lado — destino do dinheiro, garantia, liquidez, tributação. Ela não indica qual
          opção é preferível, e essa leitura depende do seu contexto.
        </p>
        <p>
          Decisões de investimento são exclusivamente suas. Para tomá-las, procure
          profissional habilitado.
        </p>
      </LegalSection>

      <LegalSection title="3. Conteúdo educativo e fontes externas">
        <p>
          Os verbetes descrevem características gerais de cada tipo de produto, com
          curadoria humana e data de revisão visível em cada página. Regras tributárias,
          prazos de carência e limites de garantia mudam por lei, e pode haver intervalo
          entre a mudança e a atualização do texto.
        </p>
        <p>
          Por isso cada verbete aponta a fonte oficial correspondente. Não respondemos
          pelo conteúdo, pela disponibilidade ou pela exatidão de sites de terceiros, e o
          número que vale é sempre o da fonte oficial.
        </p>
        <p>
          O conteúdo descreve o tipo de produto, nunca uma emissão específica. Um verbete
          sobre CRA não descreve nenhum CRA em particular.
        </p>
      </LegalSection>

      <LegalSection title="4. Contato com o assessor">
        <p>
          O botão de WhatsApp leva a uma conversa com {site.advisor.name},{" "}
          {site.advisor.role.toLowerCase()} na {site.advisor.firm}. Esse atendimento
          acontece fora deste site, sob a regulamentação aplicável à atividade e à
          instituição a que o profissional está vinculado.
        </p>
        <p>
          Este site não é canal de atendimento, de ordens nem de reclamações da
          instituição.
        </p>
      </LegalSection>

      <LegalSection title="5. Disponibilidade e propriedade">
        <p>
          O site é oferecido no estado em que se encontra, sem garantia de funcionamento
          ininterrupto. O conteúdo é de titularidade da Acássium Invest; reprodução com
          fins comerciais depende de autorização.
        </p>
      </LegalSection>

      <LegalSection title="6. Alterações e foro">
        <p>
          Estes termos podem ser alterados, e a data de revisão no rodapé indica a versão
          vigente. O tratamento de dados pessoais é regido pela{" "}
          <Link href="/privacidade" className="text-light underline-offset-4 hover:underline">
            Política de Privacidade
          </Link>
          . Aplica-se a lei brasileira. Dúvidas podem ser enviadas para{" "}
          <a
            href={`mailto:${site.contact.email}`}
            className="text-light underline-offset-4 hover:underline"
          >
            {site.contact.email}
          </a>
          .
        </p>
      </LegalSection>
    </>
  );
}
