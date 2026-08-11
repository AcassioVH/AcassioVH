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

**O mecanismo, desde então.** `tests/catalogo.test.ts` falha quando a data de
revisão passa de seis meses. Era transparência sem processo — a data envelhecia
na tela e nada acontecia. Agora o CI fica vermelho em data conhecida, e a
correção não é empurrar a data: é reler o catálogo.

**Atenção com o catálogo maior.** São 36 verbetes, e as regras de tributação de
aplicação no exterior mudaram recentemente. O risco cresceu junto com o conteúdo.

---

## 3. O guardrail não cobre copy escrita em JSX

**Impacto: baixo. Dívida fechada.**

`tests/compliance.test.ts` varre o catálogo, a navegação e a política — dados
tipados. O que ele nunca alcançou foi a copy escrita direto em componente.

**Fechado pela saída, e não pela entrada.** `scripts/varrer-html.mjs` varre o
HTML publicado depois do build. Toda palavra que chega ao leitor está ali, tenha
vindo do catálogo, de um componente ou de uma página escrita ontem — inclusive
de páginas que ainda não existem. Roda no `verify` e no CI.

**A duplicação é consciente e vigiada.** O script repete os padrões em
JavaScript puro, porque roda fora do TypeScript. `tests/conformidade-html.test.ts`
compara as duas listas e falha quando uma anda sem a outra — e checa também que
cada frase da lista de exceções existe em texto oficial do site, para ninguém
silenciar uma violação real acrescentando-a às exceções.

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

## 8. Sem coleta de dados, o risco de LGPD praticamente desapareceu

**Impacto: baixo, por construção.**

O site não tem cadastro, formulário, cookie de rastreamento nem banco. Restam os
registros técnicos do provedor de hospedagem, sob a política dele.

**Atenção ao crescer.** No dia em que entrar formulário, newsletter ou
ferramenta de audiência, a Política de Privacidade precisa mudar **no mesmo
commit** — hoje ela afirma, com todas as letras, que nada é coletado.

---

## 9. O boletim publica texto que ninguém leu antes do leitor

**Impacto: alto. É o risco mais novo e o mais diferente de todos os outros.**

Até `/boletim`, a defesa do site era o processo: alguém escrevia, alguém revisava,
e o CI varria antes do commit. O boletim rompe isso por construção — o texto
nasce em produção, gerado por um modelo de linguagem, depois do último teste ter
rodado. Nenhuma revisão humana acontece entre a apuração e a tela.

O que pode dar errado, em ordem de probabilidade:

1. **O modelo recomenda.** É o que o prompt mais proíbe, e é a saída mais
   natural para um texto sobre mercado. "O movimento abre espaço para
   prefixados" é a frase que um analista escreveria sem pensar.
2. **O modelo inventa número ou fonte.** O prompt exige veículo e data e manda
   escrever "não localizado" quando não achar. Nada garante obediência.
3. **O modelo afirma tendência de preço.** Conjuntura descreve o passado; a
   fronteira com previsão é de uma frase.

**Como está contido.**

- **Peneira automática** (`src/domain/boletim/conformidade.ts`): todo item
  gerado passa pela mesma lista de vocabulário proibido do catálogo, e o item
  que viola é descartado inteiro antes de virar HTML. A contagem aparece na
  tela, não só no log — se a peneira estiver pegando demais, isso é visível.
- **Unidade de descarte = unidade de exibição.** Cartão com um campo apagado
  faria o leitor preencher a lacuna sozinho; sai o cartão todo.
- **`tests/boletim.test.ts` testa o caminho inverso** — dez frases que *devem*
  ser descartadas. Uma peneira quebrada falha o CI em vez de relatar "nenhuma
  violação encontrada".
- **Fora do índice de busca.** A página é `noindex` e não está no sitemap nem na
  navegação: o texto gerado não entra no que o site publica ao mundo.
- **Atribuição obrigatória na tela.** Todo item mostra veículo e data; a URL,
  quando a busca devolve uma. Isso não impede invenção, mas torna a checagem
  possível em um clique.

**O que continua descoberto.** A peneira é léxica, como o detector do catálogo
(risco 4): não pega recomendação implícita, e não verifica se o número está
certo nem se a fonte existe. O rodapé da página diz para conferir as fontes
antes de citar qualquer número, e essa instrução é para valer.

**Se um dia o boletim virar material distribuído a cliente**, e não leitura de
apoio do assessor, a revisão humana antes do envio deixa de ser recomendável e
passa a ser condição.

---

## 10. A rota do boletim gasta dinheiro por requisição

**Impacto: médio. Risco de operação, não de conteúdo.**

`/api/boletim` é o primeiro endereço deste site que custa por acesso: cada
boletim são nove chamadas a um modelo, sete delas com busca web. Uma rota assim
aberta na internet sem contenção é um cartão de crédito na calçada — não exige
ataque sofisticado, basta alguém segurar o F5.

**Como está contido.**

- **Desligada por padrão.** Sem `ANTHROPIC_API_KEY` no ambiente, a rota responde
  503 e a página diz que a apuração está desligada. Um deploy limpo não gasta
  nada.
- **Limite por origem e limite global** (`src/domain/boletim/limite.ts`), em
  memória do processo.
- A chave nunca sai do servidor: não tem prefixo `NEXT_PUBLIC_` e é lida só na
  rota.

**O que continua descoberto, e importa.** A contagem vive na memória de cada
instância. Em deploy serverless, o teto real é o teto multiplicado pelo número
de instâncias vivas, e `x-forwarded-for` é cabeçalho — quem quiser furar o
limite por origem troca de valor a cada requisição. **A contenção que de fato
garante o gasto é a cota da chave, definida no painel da Anthropic.** Defina-a
antes de publicar a página, não depois.
