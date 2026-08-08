# Arquitetura — Acássium Invest

## Princípio organizador

O limite regulatório é a restrição mais forte do produto, então ele é a restrição
que organiza o código. A pergunta que orienta cada decisão é: *como fazemos com
que violar a regra seja difícil, e não apenas proibido?*

| Camada | Mecanismo | O que impede |
|---|---|---|
| Tipos | `AssetProfile` não tem campo de rentabilidade, nota ou opinião | Escrever a frase não compila |
| Testes | `tests/compliance.test.ts` varre o catálogo e a navegação | Texto com juízo de valor quebra o CI |

Nenhuma das duas depende de alguém lembrar da regra ao escrever.

Existia antes uma terceira camada — um banco sem coluna de performance. Ela
deixou de ser necessária quando o produto virou site educativo: **não há banco,
não há conta e não há coleta de dados.** O que não existe não vaza.

## Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 | Gera HTML estático; nenhuma rota depende de requisição, sessão ou banco |
| Linguagem | TypeScript estrito, com `noUncheckedIndexedAccess` | O sistema de tipos é mecanismo de conformidade, então precisa ser levado a sério |
| Estilo | Tailwind CSS 4 | Tokens de marca em `@theme`, num arquivo só |
| Movimento | Motion 12 | Revelação por rolagem, com `prefers-reduced-motion` respeitado |
| Tipografia | `next/font` — Libre Caslon Display, Source Sans 3, IBM Plex Mono | Baixadas no build e auto-hospedadas: sem CDN em runtime, sem requisição a terceiro carregando a navegação de quem lê |
| Testes | Vitest | Rápido o bastante para o guardrail rodar a cada commit |

Sem banco, sem ORM, sem autenticação, sem variável de ambiente obrigatória. O
site publica em qualquer hospedagem de arquivos estáticos.

## O sistema de marca: profundidade como clareza

A paleta é uma escala de profundidade, e ela carrega significado:

| Nível | Cor | O que vive ali |
|---|---|---|
| 1 · Superfície | `#12333B` | o nome do produto |
| 2 · Coluna d'água | `#0C2530` | para onde vai o seu dinheiro |
| 3 · Zona iluminada | `#0B1D24` | a estrutura e a comparação |
| 4 · Fundo | `#081A21` | os documentos da emissão |
| 5 · Abismo | `#040809` | **fora do nosso escopo** |

Profundidade indica **nível de detalhe, nunca valor, risco ou desempenho**. O
nível 5 é onde ficam recomendação, projeção e juízo de mérito: a marca declara o
próprio limite em cor, antes de declará-lo em texto legal.

A home percorre essa escala de cima a baixo e depois **volta à luz** na seção de
contato — a única que sobe de novo. Não é enfeite: a subida é o argumento de que
o passo seguinte à informação é uma conversa com uma pessoa. `WhatsAppCTA` repete
esse gradiente ao fim de cada página interna, pelo mesmo motivo.

**A marca.** As duas hastes do "A" precisam se **tocar**: a maior é o ativo, a
menor é a explicação, e a menor nasce de dentro da maior. A primeira versão eram
dois retângulos inclinados ancorados na base que nunca se encostavam — duas
barras paralelas não são um "A" e, pior, não dizem a tese, porque nada apoiado em
nada não apoia. Hoje é SVG, e a ordem de desenho é parte do desenho: a haste
menor vem primeiro e a maior por cima, então a junção some sob a haste que
sustenta. A travessa continua ausente por decisão — a marca sustenta, não conclui.

Duas regras estão codificadas, não confiadas a quem usar:

- **Estado é cor MAIS palavra, nunca cor sozinha.** `StatusPill` exige `label`.
- **Não há verde no sistema.** Verde diria "bom" e vermelho diria "ruim", e o
  site não emite juízo sobre produto nenhum. `StatusPill` não aceita cor
  arbitrária — só os estados nomeados.

**Cuidado de nomenclatura, aprendido na prática.** Um token de cor não pode ter
nome que colida com utilidade nativa do Tailwind. O tom `#060D10` chama-se
`ground` e não `base` porque `text-base` já é o tamanho de fonte padrão: com o
token chamado `base`, a regra de cor passava a sobrescrever a cor de todo texto
naquele tamanho, e o texto sumia no fundo.

## A organização do conteúdo: dois níveis, e por quê

`src/domain/assets/families.ts` define os dois cortes que a navegação usa.

**Categoria** é a porta: renda fixa, renda variável, internacional, fundos,
previdência, estruturados. É o vocabulário que o visitante já traz quando chega,
e usá-lo respeita o que ele já sabe.

O critério que decide em qual categoria um produto entra é **estrutural, não
jurídico**. Um FII é um fundo, mas a cota é negociada em bolsa e o preço se forma
na negociação, sem valor de resgate contratado — então ele mora em renda
variável, junto das ações, e não em "fundos" com os abertos. Separar pela
embalagem jurídica mandaria para gavetas diferentes dois produtos que funcionam
igual para quem investe. `tests/domain.test.ts` fixa essa escolha.

"Internacional" virou categoria própria pelo mesmo motivo: o que distingue o BDR
não é a forma de negociação, é o resultado depender de um ativo fora do país e da
variação do câmbio.

**Família** é a explicação: o agrupamento por **para onde vai o seu dinheiro** —
Tesouro, banco, empresa, carteira de recebíveis, fundo, emissor no exterior,
seguradora. Esse critério é conteúdo, não arrumação: agrupar por rentabilidade ou
por risco seria julgar, enquanto agrupar por destino descreve a estrutura, que é
o que o site faz.

A descoberta é o produto. Entrar por "renda fixa" e encontrar ali dentro quatro
destinos diferentes — o Tesouro, um banco, uma empresa e uma carteira de
recebíveis — é o momento em que o site ensina alguma coisa.

**A pergunta já foi "quem paga você", e virou "para onde vai o seu dinheiro".**
Os dois cortes descrevem a mesma estrutura, em sentidos opostos, e a escolha é de
leitura, não de fato: quem chega numa página de investimento pensa primeiro no
dinheiro que sai da mão dele, não no que volta. Começar por "Você" põe o leitor
no primeiro elo — que é onde ele está quando decide.

`chain` é o caminho do dinheiro e vira diagrama na tela — um diagrama que **se
percorre**. A versão parada mostrava a topologia e não a direção: dava para ler
os elos de trás para a frente sem perceber. Um pulso de luz atravessando a cadeia
na ordem certa faz o sentido ser visto, e não deduzido da seta. O movimento aqui
é a informação que faltava, não enfeite — e a velocidade é a mesma em toda
cadeia, para nenhuma parecer "pagar mais rápido".

## Uma decisão por tela

A primeira versão da home fazia tudo: as famílias, o verbete de cada produto num
painel de abas e a comparação lado a lado, na mesma rolagem. Ficou completa e
ilegível — informação demais junta, sem hierarquia, e o visitante precisava
atravessar o site inteiro para descobrir por onde começar.

A navegação hoje tem três degraus, e cada um cabe numa decisão:

| Rota | A pergunta que responde |
|---|---|
| `/` | o que é este site, e por onde eu entro |
| `/categorias/[id]` | para onde vai o dinheiro aqui dentro, e quais são os produtos |
| `/produtos/[classe]` | como funciona este produto, em detalhe |
| `/comparar` | qual a diferença entre estes dois |

A busca (`⌘K`, `/`, ou o botão na barra) é o atalho de quem já sabe a palavra;
a navegação continua sendo o caminho de quem não sabe. Ela não ordena por
mérito, não sugere produto e não tem "mais procurados" — ranking de busca viraria
ranking de produto. O índice sai do catálogo por derivação, nunca escrito à mão:
índice paralelo envelheceria na primeira ficha nova, e o produto sumiria da busca
continuando no site. `tests/busca.test.ts` exige que **toda** sigla ache o próprio
verbete.

## Gráfico como descrição

O site é sobre estrutura, e estrutura se desenha melhor do que se descreve. Três
gráficos, em `src/components/charts/`:

- **`PaymentChain`** — o caminho do dinheiro até você, elo por elo. Mais elos não
  significa pior: é topologia, não nota.
- **`CategoryBar`** — do que uma categoria é feita, medindo **contagem de
  verbetes no catálogo**. Não é volume de mercado nem captação; barra maior
  significa mais material para ler.
- **`TaxLadder`** — a tabela regressiva do IR. Alíquota vigente publicada pela
  Receita, com o link para conferir; não sugere prazo nem projeta valor.

Nenhum deles carrega grandeza que dependa de juízo — não há gráfico de
rentabilidade, de risco nem de desempenho, e não há como haver: o tipo
`AssetProfile` não guarda esses dados.

## Atmosfera, e por que é CSS

O hero e o contato usam gradiente, faixas repetidas e `transform`. Sem imagem,
sem vídeo, sem canvas e sem WebGL. Isso significa que o primeiro quadro chega
junto com o HTML, funciona sem GPU e não precisa de fallback.

**Estar dentro d'água, e não na frente de um fundo escuro.** Gradiente, feixe e
cáustica descrevem a *luz*; nenhum deles diz que existe água entre o olho e o
assunto. Quem diz isso é `MarineSnow` — a partícula em suspensão é o único
elemento da composição que ocupa o volume em vez do fundo, e é o que decide a
leitura. Três camadas com tamanho, brilho e velocidade diferentes; a paralaxe
entre elas é a profundidade. Sobem, e não descem: detrito de verdade afunda, mas
partícula subindo é o que dá a sensação de que **você** está afundando, que é a
metáfora do site inteiro.

`WaterSurface` completa o par pelo outro lado: de dentro d'água, o alto do campo
de visão é um teto líquido ondulando, e é a referência que diz de que lado da
água o olho está. Sem ela, escuro com partícula pode ser espaço sideral.
`WaterColumn` é o véu frio que se adensa para baixo — fica acima do fundo e
abaixo do conteúdo, porque velar o texto seria trocar leitura por atmosfera.

Três lições ficaram no código:

- **`Caustics` errou por excesso na primeira versão.** Faixas estreitas e
  próximas viram malha de arame e disputam atenção com o título. Luz sobre água
  tem período longo, intensidade desigual e dissolve conforme desce — daí a
  máscara vertical e o período de ~120px.
- **A superfície custou legibilidade à navegação.** A parte mais clara da
  composição passou a ficar exatamente onde fica a barra fixa, e os links caíram
  em cima das cristas. A correção não foi apagar a onda: foi um véu de
  degradê sob a barra, que escurece o bastante para o texto e vai a zero antes de
  alcançar a onda.
- **`DepthGauge` perdeu os rótulos, e depois os recuperou de outro jeito.** Os
  nomes dos níveis, fixos ao lado das marcas, invadiam a primeira coluna do
  conteúdo em telas largas, e foram removidos. A remoção resolveu o atropelo e
  custou a leitura: sem nome, a régua vira enfeite e a escala deixa de ensinar o
  que significa. A solução não era escolher entre as duas coisas, era separá-las
  no tempo — o nome aparece só no instante em que o nível muda e se apaga
  sozinho. Parado, a régua é marca; descendo, ela diz onde você está.
- **`DepthGauge` perdeu os rótulos.** Os nomes dos níveis invadiam a primeira
  coluna do conteúdo em telas largas. A correção não foi encolher a fonte: foi
  notar que o rótulo já existe no olho de cada seção, e repeti-lo na régua era
  redundância que custava espaço.

## Estrutura de pastas

```
src/
├── app/
│   ├── page.tsx                # a home: apresentação e as categorias
│   ├── categorias/[id]/        # a categoria: famílias, diagramas e produtos
│   ├── produtos/[classe]/      # verbete por produto, estático
│   ├── comparar/               # duas estruturas lado a lado
│   ├── (legal)/                # termos e privacidade
│   └── globals.css             # tokens da marca (@theme)
├── components/
│   ├── charts/                 # gráficos de estrutura e o cartão de produto
│   ├── experience/             # atmosfera: cáusticas, feixes, régua de profundidade
│   ├── marketing/              # seções da home
│   ├── brand/                  # a marca: as duas hastes do "A"
│   └── ui/                     # primitivos (Reveal, StatusPill, Disclaimer, WhatsAppCTA)
├── domain/                     # núcleo — sem React, sem UI
│   ├── assets/                 # taxonomia, famílias, verbetes, classificação
│   ├── cnpj/                   # validação e normalização
│   └── compliance/             # política e detector de violações
└── config/                     # configuração institucional
tests/                          # guardrail de conformidade + domínio
```

`src/domain/` não importa nada de React: o núcleo regulatório precisa ser
testável sem montar componente.

## Estado

O site está completo como peça de conteúdo. O que falta é operacional:

1. **Razão social e CNPJ** nas páginas legais (`NEXT_PUBLIC_LEGAL_ENTITY`).
2. **Revisão jurídica** dos dois documentos legais. Definir
   `NEXT_PUBLIC_LEGAL_REVIEWED=true` retira o aviso de "documento em elaboração".
3. **Domínio e publicação.** Sendo estático, qualquer hospedagem serve.

O histórico do git guarda a versão anterior do produto — com conta, banco,
carteira e criptografia — caso um dia a área logada volte.
