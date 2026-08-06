# Arquitetura — Acássium Invest

## Princípio organizador

O limite regulatório é a restrição mais forte do produto, então ele é a
restrição que organiza o código. A pergunta que orienta cada decisão de
arquitetura é: *como fazemos com que violar a regra seja difícil, e não apenas
proibido?*

A resposta são três camadas de contenção, em ordem crescente de custo para
contornar:

| Camada | Mecanismo | O que impede |
|---|---|---|
| Tipos | `AssetProfile` não tem campo de rentabilidade, nota ou opinião | Escrever a frase não compila |
| Schema | Banco sem coluna de performance | O que não é armazenado não vaza em relatório |
| Testes | `tests/compliance.test.ts` varre o conteúdo | Texto com juízo de valor quebra o CI |

Nenhuma das três depende de alguém lembrar da regra no momento de escrever.

## Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 | Front e back no mesmo projeto; Server Components mantêm dado de carteira no servidor por padrão |
| Linguagem | TypeScript estrito, com `noUncheckedIndexedAccess` | O sistema de tipos é mecanismo de conformidade, então precisa ser levado a sério |
| Estilo | Tailwind CSS 4 | Tokens de marca em `@theme`, num arquivo só |
| Animação de UI | Motion 12 | `whileInView` para as revelações por rolagem |
| Tipografia | `next/font` (Libre Caslon Display, Source Sans 3, IBM Plex Mono) | Baixadas no build e auto-hospedadas: sem CDN em runtime, sem requisição a terceiro carregando navegação do usuário |
| Banco | PostgreSQL + Prisma 7 | Schema versionado e revisável em PR — o principal artefato de auditoria |
| Autenticação | `jose` + argon2id, sessão própria | Ver abaixo |
| Validação | Zod | Uma fronteira única entre `FormData` e o domínio tipado |
| Testes | Vitest | Rápido o bastante para o guardrail rodar em cada commit |

### Por que Prisma e não Supabase

Supabase Auth economizaria tempo de Fase 1. A troca que não compensa aqui é
onde a regra de negócio passa a morar: RLS configurada por painel é difícil de
revisar em PR e difícil de apresentar numa auditoria. Com Prisma, o schema e as
políticas de acesso são código, com histórico em git. Num produto cuja tese é
"somos descritivos e conseguimos provar isso", esse histórico vale mais que as
semanas economizadas.

### Por que autenticação própria e não NextAuth

Esta é a decisão mais discutível do projeto, então vai com o raciocínio inteiro.

O caminho padrão seria Auth.js (NextAuth v5). O problema é que a v5 segue em
beta — `5.0.0-beta.32` — e a v4 estável não acompanha bem o Next 16 com React
19. Para um produto que guarda dado financeiro, depender de um beta perpétuo na
camada de autenticação é uma dívida com data de vencimento incerta.

O que precisamos é pequeno: e-mail e senha, sem OAuth, sem provedores externos.
Isso cabe em três arquivos auditáveis:

- **`password.ts`** — argon2id com os parâmetros do OWASP (19 MiB, 2 iterações).
- **`session.ts`** — JWT assinado com HS256 via `jose`, em cookie `httpOnly` +
  `secure` + `sameSite=lax`, referenciando uma linha em `sessions`.
- **`actions.ts`** — cadastro, login e logout como Server Actions.
- **`security/rate-limit-policy.ts`** — janela deslizante, função pura.
- **`security/rate-limit.ts`** — contagem no Postgres.

O registro em banco existe porque **JWT sozinho não se revoga**: sem ele, um
logout apagaria o cookie do navegador e deixaria uma cópia do token válida até
expirar. Com ele, encerrar sessão ou excluir a conta invalida de fato.

Três cuidados que costumam faltar em implementação caseira e estão aqui: o login
devolve **a mesma mensagem** para e-mail inexistente e senha errada; calcula um
hash descartável quando o usuário não existe — sem isso, a diferença de tempo de
resposta entrega quais e-mails estão cadastrados; e limita tentativas por conta
e por IP, checando **antes** do argon2, que custa ~50ms de propósito e sem
limite viraria vetor de exaustão de recursos. O detalhamento do limite está em
`docs/RISKS.md`, risco 9.

**O gatilho para migrar** é claro: no dia em que entrar login social, 2FA ou
mágica por e-mail, o custo de manter isso à mão passa a superar o de adotar
Auth.js. Até lá, o que temos é menor, estável e inteiramente revisável.

### O sistema de marca: profundidade como clareza

A paleta é uma escala de profundidade, e ela carrega significado:

| Nível | Cor | O que vive ali |
|---|---|---|
| 1 · Superfície | `#12333B` | o nome do ativo |
| 2 · Coluna d'água | `#0C2530` | o que o ativo é |
| 3 · Zona iluminada | `#0B1D24` | estrutura e ordem |
| 4 · Fundo | `#081A21` | documentos da emissão |
| 5 · Abismo | `#040809` | **fora do nosso escopo** |

Profundidade indica **nível de detalhe, nunca valor, risco ou desempenho**. O
nível 5 é onde ficam recomendação, projeção e juízo de mérito: a marca declara
o próprio limite em cor, e não só em texto legal. A landing desce essa escala
de cima a baixo, e a última seção — o limite do serviço — é a mais escura.

Duas regras do sistema estão codificadas, não confiadas a quem usar:

- **Estado é cor MAIS palavra, nunca cor sozinha.** `StatusPill` exige `label`.
- **Não há verde no sistema**, e não há vermelho na paleta de categorias. Verde
  diria "bom" e vermelho diria "ruim"; o produto não emite juízo sobre ativo
  nenhum. `StatusPill` não aceita cor arbitrária — só os estados nomeados.

**Cuidado de nomenclatura, aprendido na prática.** Um token de cor não pode ter
nome que colida com utilidade nativa do Tailwind. O tom `#060D10` chama-se
`ground` e não `base` porque `text-base` já é o tamanho de fonte padrão: com o
token chamado `base`, toda a regra de cor `text-base` passava a sobrescrever a
cor de qualquer texto que usasse aquele tamanho, e o texto sumia no fundo.

### Divergências deliberadas do arquivo de design

O design é a referência, mas duas coisas foram decididas diferente, com o
cliente, e ficam registradas para não serem "corrigidas" depois por engano:

1. **Composição por valor, não por contagem.** O design agrupa por número de
   ativos ("Securitização · 7") e diz que não é alocação por valor. O produto
   mostra a participação do valor declarado, com a contagem como informação
   secundária. Somar valores que o próprio usuário informou continua sendo
   aritmética sobre os dados dele — descrição, não avaliação — e era o que o
   briefing original pedia.

2. **"Parte do nome e do CNPJ", não "identifica pelo CNPJ".** O design afirma
   identificação pelo CNPJ; isso só é verdade para fundos. Ver risco 1 em
   `docs/RISKS.md`. A landing não deve prometer o que o dado público não
   sustenta.

As telas **B (conexão com instituição)** e **D (acervo com glossário)** do
design descrevem funcionalidades de Fase 2 que não existem no backend. Não
foram implementadas como fachada.

### Por que não há mais cena 3D

O design substituiu o objeto flutuante do hero por profundidade e luz — camadas
de gradiente e feixes inclinados, em CSS puro. Isso tirou Three.js,
`@react-three/fiber` e `@react-three/drei` do projeto: 54 pacotes e ~350 KB a
menos no carregamento inicial, sem detecção de WebGL e sem fallback, porque
gradiente funciona sem GPU e sem JavaScript.

## Estrutura de pastas

```
prisma/
├── schema.prisma             # modelo de dados (LGPD + limite regulatório)
└── migrations/               # histórico versionado
src/
├── app/
│   ├── page.tsx              # landing pública
│   ├── (auth)/               # entrar, criar-conta — redireciona se logado
│   ├── (app)/                # área autenticada, noindex
│   │   ├── carteira/         # painel de composição
│   │   ├── ativos/[classe]/  # ficha educativa
│   │   └── conta/            # LGPD: exportar e excluir
│   ├── api/conta/exportar/   # portabilidade em JSON
│   └── globals.css           # tokens da marca (@theme)
├── components/
│   ├── marketing/            # seções da landing
│   ├── portfolio/            # formulário e gráficos da carteira
│   ├── auth/, account/       # formulários de conta
│   ├── brand/                # marca: as duas hastes do "A"
│   └── ui/                   # primitivos (Section, Field, StatusPill)
├── domain/                   # núcleo — sem React, sem UI
│   ├── cnpj/                 # validação e normalização
│   ├── assets/               # taxonomia, classificação, fichas
│   ├── portfolio/            # dinheiro, agregação, FGC, vencimentos
│   └── compliance/           # política e detector de violações
├── lib/                      # infraestrutura: db, auth, ações, validação
└── config/                   # configuração institucional
tests/                        # guardrail de conformidade + domínio
docs/                         # esta pasta
```

`src/domain/` não importa nada de React. Isso é deliberado: o núcleo
regulatório precisa ser testável sem montar componente, e reutilizável por
rotas de API, jobs da Fase 2 e eventuais scripts de auditoria.

## Fluxo de um ativo

```
entrada do usuário (nome + CNPJ + valor)
        │
        ├─► parseCnpj ──────────► Cnpj | null   (dígito verificador)
        │
        └─► classifyAsset ──────► { assetClass, confidence, needsUserConfirmation }
                                          │
                                          ▼
                                    profileFor(assetClass)
                                          │
                                          ▼
                            ficha educativa + links para fonte oficial
```

O ponto importante do desenho está em `confidence`. Ver
`docs/RISKS.md`, risco 1: o CNPJ identifica uma pessoa jurídica, não um título,
então a classificação é inferência para tudo que não é fundo. Como inferência
erra, ela é apresentada com o grau de certeza que tem, e confiança baixa vira
pedido de confirmação em vez de palpite exibido como fato.

## Dinheiro em centavos inteiros

`declaredValueCents` é inteiro de centavos em toda a aplicação, nunca `Float`.
Ponto flutuante acumula erro de arredondamento — `0.1 + 0.2 !== 0.3` — e num
total de carteira isso aparece como centavo perdido que o usuário percebe e não
perdoa. A formatação acontece só na borda da interface, em `formatCents`.

No banco a coluna é `String`, não `BigInt`, porque o valor está cifrado e
criptograma é opaco por natureza. A tipagem forte sobrevive na fronteira de
`loadPortfolio`, que decifra e converte de volta para número.

## Criptografia em repouso

Quatro campos do `Asset` são cifrados com AES-256-GCM antes de chegar ao banco:
`name`, `cnpj`, `institution` e `declaredValueCents` — o que, onde e quanto.

O cenário coberto é o do **dump**: backup vazado, réplica mal configurada,
acesso de leitura amplo demais. TLS não ajuda aí, e o controle de acesso do
Postgres já foi contornado por definição. Comprometimento do servidor da
aplicação **não** está coberto — lá a chave está em memória, por necessidade, e
nenhum esquema de criptografia de campo resolve isso.

Três escolhas que fazem diferença:

- **GCM, não CBC.** Cifra autenticada detecta adulteração: quem tiver acesso de
  escrita não consegue alterar um valor declarado sem que a leitura falhe.
- **IV aleatório por valor.** Com IV fixo, valores iguais gerariam criptogramas
  iguais e a tabela entregaria, por simples comparação, quais usuários têm a
  mesma instituição — sem decifrar nada.
- **Subchaves por finalidade, via HKDF.** A mestra nunca é usada diretamente;
  cifra e HMAC têm chaves derivadas distintas.

`assetClass` e `maturityDate` ficam em claro por decisão consciente, registrada
em `docs/RISKS.md`, risco 8. Já as chaves de `auth_attempts` usam HMAC em vez de
cifra: a busca ali é por igualdade exata, e o IV aleatório impediria reencontrar
a linha.

**A contrapartida é séria e está no risco 11:** perder `FIELD_ENCRYPTION_KEY`
significa perder toda a carteira de todos os usuários. Custódia da chave é
pré-requisito de produção.

## Fase 1 — estado

Entregue e verificado ponta a ponta contra Postgres real:

- [x] Landing page
- [x] Cadastro, login, logout e proteção de rotas
- [x] Schema Prisma com cascata de exclusão
- [x] Entrada manual de ativos, com máscara e validação de CNPJ
- [x] Motor de classificação com confirmação quando a confiança é baixa
- [x] Dashboard de composição por classe e por instituição
- [x] Segurança e Estrutura: FGC por instituição, vencimentos
- [x] Ficha educativa por classe de ativo
- [x] LGPD: exportar dados em JSON e excluir conta
- [x] Contato via WhatsApp
- [x] Limite de tentativas por conta e por IP, com janela deslizante
- [x] Criptografia em repouso dos campos sensíveis da carteira

Pendências conhecidas, detalhadas em `docs/RISKS.md`:

1. **Custódia da chave de cifra** (risco 11) — cofre de segredos e procedimento
   de restauração. É operacional, não código, e bloqueia produção.
2. **Verificação de e-mail** e recuperação de senha.
3. **Log de auditoria** de acesso a dado de carteira.
