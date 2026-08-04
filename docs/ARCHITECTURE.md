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
| Banco | PostgreSQL + Prisma | Schema versionado e revisável em PR — o principal artefato de auditoria |
| Testes | Vitest | Rápido o bastante para o guardrail rodar em cada commit |

### Por que Prisma e não Supabase

Supabase Auth economizaria tempo de Fase 1. A troca que não compensa aqui é
onde a regra de negócio passa a morar: RLS configurada por painel é difícil de
revisar em PR e difícil de apresentar numa auditoria. Com Prisma, o schema e as
políticas de acesso são código, com histórico em git. Num produto cuja tese é
"somos descritivos e conseguimos provar isso", esse histórico vale mais que as
semanas economizadas.

### Por que react-three-fiber e não Three.js imperativo

O vazamento clássico de um hero 3D é o contexto WebGL que sobrevive à
navegação. Com R3F o ciclo de vida da cena é o ciclo de vida do componente, e o
descarte acontece sozinho. A cena também precisa ser desligada sob
`prefers-reduced-motion`, e isso é uma prop (`frameloop`) em vez de um
`cancelAnimationFrame` espalhado.

## Estrutura de pastas

```
src/
├── app/                      # rotas (App Router)
│   ├── page.tsx              # landing
│   ├── layout.tsx            # shell + metadados
│   ├── globals.css           # tokens da marca (@theme)
│   └── icon.svg
├── components/
│   ├── marketing/            # seções da landing
│   ├── three/                # cena 3D do hero
│   └── ui/                   # primitivos (Section, Reveal, Disclaimer)
├── domain/                   # núcleo — sem React, sem UI
│   ├── cnpj/                 # validação e normalização
│   ├── assets/               # taxonomia, classificação, fichas
│   └── compliance/           # política e detector de violações
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

## Fase 1 — o que falta

O scaffold entrega landing, domínio e guardrail. Falta:

1. **Auth** — cadastro/login, com verificação de e-mail.
2. **Schema Prisma** — `User`, `Portfolio`, `PortfolioAsset`, `AuditLog`, com
   criptografia em repouso nos campos sensíveis e exclusão em cascata.
3. **Entrada de ativos** — formulário com máscara e validação de CNPJ.
4. **Dashboard** — composição real, reaproveitando os componentes de gráfico da
   landing.
5. **Conta e dados** — exportar e excluir, requisito de LGPD.
