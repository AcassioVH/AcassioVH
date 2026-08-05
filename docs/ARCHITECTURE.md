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
| 3D | Three.js via `@react-three/fiber` | Cena declarativa e, principalmente, descarte de contexto WebGL no unmount |
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

O registro em banco existe porque **JWT sozinho não se revoga**: sem ele, um
logout apagaria o cookie do navegador e deixaria uma cópia do token válida até
expirar. Com ele, encerrar sessão ou excluir a conta invalida de fato.

- **`security/rate-limit-policy.ts`** — janela deslizante, função pura.
- **`security/rate-limit.ts`** — contagem no Postgres.

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

### Por que react-three-fiber e não Three.js imperativo

O vazamento clássico de um hero 3D é o contexto WebGL que sobrevive à
navegação. Com R3F o ciclo de vida da cena é o ciclo de vida do componente, e o
descarte acontece sozinho. A cena também precisa ser desligada sob
`prefers-reduced-motion`, e isso é uma prop (`frameloop`) em vez de um
`cancelAnimationFrame` espalhado.

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
│   ├── three/                # cena 3D do hero
│   └── ui/                   # primitivos (Section, Field, Disclaimer)
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

`declaredValueCents` é `BigInt` no banco e inteiro em memória, nunca `Float`.
Ponto flutuante acumula erro de arredondamento — `0.1 + 0.2 !== 0.3` — e num
total de carteira isso aparece como centavo perdido que o usuário percebe e não
perdoa. A conversão para texto acontece só na borda da interface, em
`formatCents`.

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

Pendências conhecidas, detalhadas em `docs/RISKS.md`:

1. **Criptografia em repouso** dos campos sensíveis da carteira (risco 8).
2. **Verificação de e-mail** e recuperação de senha.
3. **Log de auditoria** de acesso a dado de carteira.
