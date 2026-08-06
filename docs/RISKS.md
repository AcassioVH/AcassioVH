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

**Impacto: médio. Dívida conhecida, hoje menor.**

`tests/compliance.test.ts` varre o catálogo, a **navegação por categoria e
família**, a política e os racionais do classificador. Não varre string escrita
direto em componente — e o site tem texto editorial nas seções da home e nos
títulos das páginas de categoria.

A navegação entrou na varredura porque não é rótulo de arrumação: `summary`,
`trait`, `whoPays` e `blurb` afirmam coisas sobre os produtos e aparecem na tela
como qualquer verbete. Um texto que orientasse escolha caberia perfeitamente num
campo desses, e passava calado.

**Próximo passo.** Extrair a copy das seções para módulos tipados e incluí-los na
varredura, ou rodar o detector sobre o HTML gerado no build — o build é estático,
então o HTML final existe em disco e dá para varrê-lo inteiro.

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

## 6. Gráfico afirma mais rápido do que texto — e erra mais rápido também

**Impacto: médio. Risco novo, criado junto com os gráficos.**

Um desenho comunica antes de ser lido, e comunica coisas que ninguém escreveu.
Barras que descem sugerem piora; um diagrama com menos elos parece mais limpo,
logo melhor. Nenhuma dessas leituras está no texto, e todas chegam ao olho.

**Como está contido.** Cada gráfico mede uma grandeza declarada no próprio
componente: `PaymentChain` mostra topologia, `CategoryBar` mostra contagem de
verbetes, `TaxLadder` mostra alíquota vigente de lei. Nenhum ordena por mérito, e
a legenda diz em palavras o que a forma mostra.

**Ao adicionar um gráfico novo**, a pergunta é a mesma dos campos de
`AssetProfile`: a grandeza é verificável em fonte oficial, ou depende de juízo?
Gráfico de rentabilidade, de risco ou de desempenho não entra — e não entraria
mesmo que alguém quisesse, porque o tipo não guarda esses dados.

---

## 7. O convite ao WhatsApp está em todas as páginas

**Impacto: baixo, com atenção permanente ao texto.**

O botão aparece na barra fixa, no meio da leitura e ao fim de cada página. Isso é
o desenho do produto: o site informa e a conversa acontece com uma pessoa.

**O que não pode acontecer.** O convite não pode virar chamada de urgência
("aproveite", "não perca", "fale agora antes que"), porque aí deixa de ser porta
de contato e vira gatilho comercial sobre decisão de investimento.

**Como está contido.** Todo o texto do convite vive em `WhatsAppCTA`, num arquivo
só, e a ressalva de que a assessoria acontece fora do site sai sempre junto.

---

## 6. Sem coleta de dados, o risco de LGPD praticamente desapareceu

**Impacto: baixo, por construção.**

O site não tem cadastro, formulário, cookie de rastreamento nem banco. Restam os
registros técnicos do provedor de hospedagem, sob a política dele.

**Atenção ao crescer.** No dia em que entrar formulário, newsletter ou
ferramenta de audiência, a Política de Privacidade precisa mudar **no mesmo
commit** — hoje ela afirma, com todas as letras, que nada é coletado.
