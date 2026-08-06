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
  description:
    "O que a Acássium Invest faz, o que não faz, e as condições de uso da plataforma.",
};

export default function TermsPage() {
  return (
    <>
      <LegalTitle>Termos de Uso</LegalTitle>
      <p className="mt-4 text-lg text-aux">
        As condições de uso da Acássium Invest. Ao criar uma conta, você concorda com o
        que está aqui.
      </p>

      <PendingLegalReviewNotice />

      <LegalSection title="1. O que este serviço é">
        <p>
          A Acássium Invest, operada por <ControllerIdentification />, é uma ferramenta
          que organiza e descreve a carteira de investimentos que o próprio usuário
          informa.
        </p>
        <p>Concretamente, o serviço faz quatro coisas:</p>
        <LegalList
          items={[
            "Identifica cada ativo pelo nome declarado e, quando informado, pelo CNPJ, classificando-o por tipo.",
            "Organiza a composição da carteira por classe de ativo e por instituição.",
            "Explica as características gerais de cada tipo de ativo: quem emite, como funciona a liquidez, qual a tributação aplicável e qual a estrutura de garantia.",
            "Indica as fontes oficiais onde você pode conferir os dados por conta própria.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. O que este serviço não é">
        <p className="text-title">
          Esta é a cláusula mais importante destes termos, e ela define o produto inteiro.
        </p>
        <p>
          A Acássium Invest não presta consultoria, análise ou recomendação de valores
          mobiliários. O conteúdo é meramente informativo e descritivo. Especificamente, o
          serviço:
        </p>
        <LegalList
          items={[
            "Não indica o que comprar, o que manter ou o que trocar.",
            "Não qualifica ativo como bom ou ruim, adequado ou inadequado ao seu perfil.",
            "Não calcula nem afirma rentabilidade, retorno ou desempenho de qualquer ativo.",
            "Não faz projeção de resultado nem previsão de preço.",
            "Não executa ordens, não custodia valores e não movimenta recursos.",
          ]}
        />
        <p>
          A soma, o agrupamento e a comparação de valores que você informa são operações
          aritméticas sobre os seus próprios dados, e não constituem avaliação da sua
          carteira. Decisões de investimento são exclusivamente suas, e para tomá-las você
          deve procurar profissional habilitado.
        </p>
        <p>
          O contato com assessor de investimentos oferecido no site acontece fora desta
          plataforma, sob a regulamentação aplicável àquela atividade e à instituição a que
          o profissional está vinculado.
        </p>
      </LegalSection>

      <LegalSection title="3. Os dados são seus e a responsabilidade por eles também">
        <p>
          Tudo o que a plataforma exibe deriva do que você digitou. Não conferimos os
          valores informados contra extratos, corretoras ou qualquer fonte externa, e não
          temos como saber se um valor está desatualizado.
        </p>
        <p>
          Se você informar um valor incorreto, a leitura resultante estará incorreta. A
          conferência é sua.
        </p>
      </LegalSection>

      <LegalSection title="4. Limites da classificação automática">
        <p>
          O CNPJ identifica uma pessoa jurídica, não um título específico. Isso funciona
          bem para fundos, que possuem CNPJ próprio, mas não para CDB, LCI ou LCA — nesses
          casos o CNPJ é o da instituição emissora, e o mesmo número corresponde a diversos
          papéis diferentes.
        </p>
        <p>
          Por isso a classificação combina o nome declarado com o CNPJ e indica o grau de
          confiança do resultado. Quando a confiança é baixa, o sistema pede a sua
          confirmação em vez de apresentar um palpite como se fosse certeza. Ainda assim, a
          classificação pode errar, e a conferência final cabe a você.
        </p>
      </LegalSection>

      <LegalSection title="5. Conteúdo educativo e fontes externas">
        <p>
          As fichas descrevem características gerais de cada tipo de ativo, com curadoria
          humana e data de revisão visível. Regras tributárias e limites de garantia mudam
          por lei, e pode haver intervalo entre a mudança e a atualização do texto.
        </p>
        <p>
          Por isso cada ficha aponta a fonte oficial correspondente. Não respondemos pelo
          conteúdo, pela disponibilidade ou pela exatidão de sites de terceiros, e o número
          que vale é sempre o da fonte oficial.
        </p>
      </LegalSection>

      <LegalSection title="6. Sua conta">
        <p>
          Você é responsável por manter a confidencialidade da sua senha e pelas ações
          realizadas na sua conta. Use uma senha que não seja reaproveitada de outro
          serviço.
        </p>
        <p>
          Você pode encerrar a conta quando quiser, pela página{" "}
          <Link href="/conta" className="text-light underline-offset-4 hover:underline">
            Conta e dados
          </Link>
          . A exclusão é imediata e definitiva.
        </p>
        <p>
          Podemos suspender contas que tentem comprometer a segurança ou a disponibilidade
          da plataforma, ou que a utilizem para finalidade diversa da descrita no item 1.
        </p>
      </LegalSection>

      <LegalSection title="7. Disponibilidade">
        <p>
          O serviço é oferecido no estado em que se encontra. Não garantimos
          funcionamento ininterrupto nem ausência de falhas, e pode haver interrupção para
          manutenção. Recomenda-se manter os seus próprios registros: esta plataforma
          organiza uma cópia dos dados que você informou, e não substitui os extratos das
          suas instituições.
        </p>
      </LegalSection>

      <LegalSection title="8. Alterações e foro">
        <p>
          Estes termos podem ser alterados. Mudanças relevantes serão comunicadas pelo
          e-mail cadastrado antes de entrarem em vigor. O uso continuado após a
          comunicação significa concordância com a nova versão.
        </p>
        <p>
          O tratamento de dados pessoais é regido pela{" "}
          <Link href="/privacidade" className="text-light underline-offset-4 hover:underline">
            Política de Privacidade
          </Link>
          . Estes termos são regidos pela lei brasileira. Dúvidas podem ser enviadas para{" "}
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
