# Riscos técnicos

Levantados antes de escrever código, atualizados conforme o scaffold avançou.
Ordenados por impacto no produto, não por dificuldade de resolver.

---

## 1. O CNPJ não identifica o produto — identifica a pessoa jurídica

**Impacto: médio no site educativo. Era alto quando havia carteira.**

O CNPJ identifica uma pessoa jurídica, não um título. Resolve bem fundos, que
têm registro próprio na CVM, mas não CDB, LCI ou LCA — nesses o CNPJ é o da
instituição emissora, e o mesmo número cobre vários papéis.

**Como está tratado.** O site descreve **tipos** de produto, não emissões
específicas, então a ambiguidade não chega ao leitor. O classificador continua
no domínio (`classify.ts`) com confiança explícita, coberto por testes, para o
caso de a área logada voltar.

---

## 2. Conteúdo educativo desatualizado

**Impacto: alto. É o principal risco do site.**

Os verbetes afirmam regras de tributação, carência e cobertura do FGC. Essas
regras mudam por lei e por medida provisória. Um verbete errado é conteúdo
incorreto sobre matéria regulada — e agora o conteúdo é o produto inteiro.

**Como está tratado.** Todo verbete tem `officialSources`, `TAX_NOTICE` avisa
que regras mudam, e `CATALOG_REVIEWED_AT` aparece na tela em cada página.

**Próximo passo.** Processo de revisão com data marcada, não "quando alguém
lembrar". Vale um teste que falhe quando o catálogo passar de N meses sem
revisão.

---

## 3. O guardrail não cobre copy escrita em JSX

**Impacto: médio. Dívida conhecida, e maior agora.**

`tests/compliance.test.ts` varre o catálogo, a política e os racionais do
classificador. Não varre string escrita direto em componente — e o site novo tem
bastante texto editorial nas seções.

**Próximo passo.** Extrair a copy das seções para módulos tipados e incluí-los na
varredura, ou rodar o detector sobre o HTML gerado no build.

---

## 4. Falso positivo e falso negativo no detector

**Impacto: médio.**

O detector é léxico: não pega recomendação implícita. "Produtos como este
costumam agradar quem busca previsibilidade" não usa palavra proibida e ainda
assim orienta.

**Como está tratado.** O teste inclui casos que *devem* ser detectados, para que
uma varredura quebrada não passe como "nenhuma violação". Revisão humana de
conteúdo novo continua obrigatória.

---

## 5. A comparação de estruturas é a superfície mais sensível do site

**Impacto: médio.**

Comparar tipos de produto por características verificáveis é descrição, e é o
que material educativo faz. A linha fica fina se alguém adicionar ordenação,
pontuação, coluna de "veredito" ou destaque visual sugerindo preferência.

**Como está contido.** A tabela não ordena, não pontua e não conclui. A ausência
de uma coluna de veredito é o mecanismo, e há nota explícita abaixo dela.

**Ao mexer nessa seção**, releia `docs/COMPLIANCE.md` antes.

---

## 6. Sem coleta de dados, o risco de LGPD praticamente desapareceu

**Impacto: baixo, por construção.**

O site não tem cadastro, formulário, cookie de rastreamento nem banco. Restam os
registros técnicos do provedor de hospedagem, sob a política dele.

**Atenção ao crescer.** No dia em que entrar formulário, newsletter ou
ferramenta de audiência, a Política de Privacidade precisa mudar **no mesmo
commit** — hoje ela afirma, com todas as letras, que nada é coletado.
