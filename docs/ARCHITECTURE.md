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
| 2 · Coluna d'água | `#0C2530` | quem paga você |
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

**Família** é a explicação: o agrupamento por **quem paga você** — Tesouro,
banco, empresa, carteira de recebíveis, fundo, mercado, seguradora. Esse critério
é conteúdo, não arrumação: agrupar por rentabilidade ou por risco seria julgar,
enquanto agrupar por quem efetivamente paga descreve a estrutura, que é o que o
site faz.

A descoberta é o produto. Entrar por "renda fixa" e encontrar ali dentro quatro
pagadores diferentes — o Tesouro, um banco, uma empresa e uma carteira de
recebíveis — é o momento em que o site ensina alguma coisa.

`chain`, em cada família, é a cadeia de pagamento e vira diagrama na tela.

## Uma decisão por tela

A primeira versão da home fazia tudo: as famílias, o verbete de cada produto num
painel de abas e a comparação lado a lado, na mesma rolagem. Ficou completa e
ilegível — informação demais junta, sem hierarquia, e o visitante precisava
atravessar o site inteiro para descobrir por onde começar.

A navegação hoje tem três degraus, e cada um cabe numa decisão:

| Rota | A pergunta que responde |
|---|---|
| `/` | o que é este site, e por onde eu entro |
| `/categorias/[id]` | quem paga cada coisa aqui dentro, e quais são os produtos |
| `/produtos/[classe]` | como funciona este produto, em detalhe |
| `/comparar` | qual a diferença entre estes dois |

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

Duas lições ficaram no código:

- **`Caustics` errou por excesso na primeira versão.** Faixas estreitas e
  próximas viram malha de arame e disputam atenção com o título. Luz sobre água
  tem período longo, intensidade desigual e dissolve conforme desce — daí a
  máscara vertical e o período de ~120px.
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
