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
  title: "Política de Privacidade",
  description:
    "Quais dados a Acássium Invest trata, para quê, por quanto tempo e como exercer seus direitos.",
};

/**
 * Política de Privacidade — LGPD.
 *
 * O texto descreve o comportamento real do código, não uma intenção genérica.
 * Cada afirmação aqui é verificável no repositório, e quando o sistema mudar
 * esta página precisa mudar junto — é por isso que ela cita os mecanismos pelo
 * nome em vez de falar em "medidas de segurança adequadas".
 */
export default function PrivacyPage() {
  return (
    <>
      <LegalTitle>Política de Privacidade</LegalTitle>
      <p className="mt-4 text-base text-blue-200">
        Como a Acássium Invest trata os seus dados pessoais, conforme a Lei nº
        13.709/2018 (LGPD).
      </p>

      <PendingLegalReviewNotice />

      <LegalSection title="1. Quem trata os seus dados">
        <p>
          O controlador dos dados é <ControllerIdentification />.
        </p>
        <p>
          Para qualquer assunto relativo a dados pessoais, incluindo o exercício dos
          direitos descritos abaixo, o contato é{" "}
          <a
            href={`mailto:${site.contact.email}`}
            className="text-gold underline-offset-4 hover:underline"
          >
            {site.contact.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Quais dados coletamos">
        <p>Somente o que você informa. Não coletamos nada de outras fontes.</p>
        <LegalList
          items={[
            <>
              <strong className="text-mist">Cadastro:</strong> nome e e-mail. A senha é
              guardada apenas como hash argon2id — nunca em texto legível, nem por nós.
            </>,
            <>
              <strong className="text-mist">Carteira:</strong> para cada ativo que você
              declarar, o nome, o valor, e — quando você informar — o CNPJ, a instituição
              e a data de vencimento.
            </>,
            <>
              <strong className="text-mist">Sessão:</strong> a data de expiração e o
              identificador do navegador usado no acesso, para que você possa encerrar
              sessões e para diagnóstico de segurança.
            </>,
            <>
              <strong className="text-mist">Tentativas de acesso:</strong> registros
              temporários usados para limitar tentativas de login. O e-mail e o endereço
              de IP são guardados apenas em forma de HMAC, portanto não são legíveis, e
              as linhas são apagadas assim que saem da janela de contagem.
            </>,
          ]}
        />
        <p>
          Não usamos cookies de rastreamento, não temos ferramentas de análise de
          comportamento e não perfilamos usuários.
        </p>
      </LegalSection>

      <LegalSection title="3. O que deliberadamente não guardamos">
        <p>
          O sistema não armazena rentabilidade, cotação, histórico de preço, nota, score
          ou classificação de risco de qualquer ativo. Não é omissão: essas colunas não
          existem no banco de dados.
        </p>
        <p>
          A razão é dupla. Primeiro, porque o serviço descreve a composição da carteira e
          não avalia investimentos. Segundo, porque o que não é armazenado não pode vazar.
        </p>
      </LegalSection>

      <LegalSection title="4. Para que usamos">
        <p>
          Exclusivamente para prestar o serviço: autenticar o seu acesso, organizar a
          carteira que você informou por classe e por instituição, e exibir o conteúdo
          educativo correspondente a cada tipo de ativo.
        </p>
        <p>
          As bases legais são a execução do contrato entre você e a plataforma (art. 7º,
          V) e o seu consentimento, coletado no cadastro (art. 7º, I). O consentimento
          pode ser retirado a qualquer momento pela exclusão da conta.
        </p>
      </LegalSection>

      <LegalSection title="5. Com quem compartilhamos">
        <p>
          Com ninguém. Seus dados de carteira não são vendidos, cedidos, alugados nem
          compartilhados com terceiros — incluindo instituições financeiras, corretoras e
          anunciantes.
        </p>
        <p>
          Os únicos terceiros envolvidos são os fornecedores de infraestrutura necessários
          para o serviço existir: a hospedagem da aplicação e o provedor do banco de
          dados. Eles não têm acesso ao conteúdo legível da sua carteira, pelo motivo
          descrito no item 6.
        </p>
      </LegalSection>

      <LegalSection title="6. Como protegemos">
        <LegalList
          items={[
            <>
              <strong className="text-mist">Criptografia em repouso:</strong> nome, CNPJ,
              instituição e valor de cada ativo são cifrados com AES-256-GCM antes de
              chegar ao banco. Quem obtivesse uma cópia do banco de dados encontraria
              apenas texto ilegível nesses campos.
            </>,
            <>
              <strong className="text-mist">Criptografia em trânsito:</strong> todo o
              tráfego usa HTTPS, com HSTS.
            </>,
            <>
              <strong className="text-mist">Senhas:</strong> argon2id, com os parâmetros
              recomendados pelo OWASP. Nem nós conseguimos ler a sua senha.
            </>,
            <>
              <strong className="text-mist">Acesso:</strong> toda consulta à carteira é
              filtrada pelo identificador do usuário autenticado, e as páginas de conta
              não são indexadas por buscadores.
            </>,
          ]}
        />
        <p>
          Nenhuma medida elimina risco por completo. Se ocorrer um incidente de segurança
          relevante com os seus dados, comunicaremos você e a Autoridade Nacional de
          Proteção de Dados, como determina o art. 48 da LGPD.
        </p>
      </LegalSection>

      <LegalSection title="7. Por quanto tempo guardamos">
        <p>
          Os dados de cadastro e de carteira permanecem enquanto a sua conta existir.
          Registros de tentativa de acesso são apagados ao sair da janela de contagem, que
          é de no máximo uma hora. Sessões expiram em 14 dias.
        </p>
        <p>
          Quando você exclui a conta, a remoção é imediata e definitiva: conta, sessões e
          todos os ativos declarados são apagados do banco na mesma operação. Não mantemos
          cópia, não há período de carência e não há como desfazer.
        </p>
      </LegalSection>

      <LegalSection title="8. Seus direitos">
        <p>
          O art. 18 da LGPD garante a você um conjunto de direitos sobre os seus dados.
          Dois deles estão disponíveis por conta própria, sem precisar pedir a ninguém, na
          página{" "}
          <Link href="/conta" className="text-gold underline-offset-4 hover:underline">
            Conta e dados
          </Link>
          :
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-mist">Acesso e portabilidade:</strong> baixar tudo o
              que temos sobre você em JSON, formato legível por máquina.
            </>,
            <>
              <strong className="text-mist">Eliminação:</strong> excluir a conta e todos os
              dados, com efeito imediato.
            </>,
          ]}
        />
        <p>
          Correção, anonimização, informação sobre compartilhamento e revogação de
          consentimento podem ser solicitadas pelo e-mail de contato. Responderemos no
          prazo legal.
        </p>
      </LegalSection>

      <LegalSection title="9. Alterações nesta política">
        <p>
          Se esta política mudar de forma relevante, avisaremos pelo e-mail cadastrado
          antes de a mudança entrar em vigor. A data da última revisão fica no rodapé desta
          página.
        </p>
      </LegalSection>
    </>
  );
}
