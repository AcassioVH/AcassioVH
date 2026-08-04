# Acássium Invest

Plataforma que recebe a carteira de investimentos do cliente e devolve uma
visão organizada e didática dela.

> **Conteúdo meramente informativo. Não constitui recomendação de
> investimento.** O sistema descreve a composição da carteira informada pelo
> usuário. Não recomenda, não avalia ativos e não afirma rentabilidade — para
> isso, aponta sempre para a fonte oficial.

## Começando

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev                  # http://localhost:3000
```

```bash
npm run verify   # typecheck + lint + testes
npm test         # só os testes (inclui o guardrail de conformidade)
npm run build    # build de produção
```

## Estado atual

**Fase 1, em andamento.** O que está pronto:

- Landing page completa — hero 3D, composição, fichas de ativos, segurança,
  limite regulatório e contato
- Validação de CNPJ com dígito verificador
- Motor de classificação com grau de confiança explícito
- Catálogo educativo curado, cobrindo 17 classes de ativo
- Guardrail de conformidade automatizado (29 testes)

O que falta para fechar a Fase 1 está listado em
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#fase-1--o-que-falta):
autenticação, schema Prisma, entrada de ativos, dashboard e as rotinas de LGPD.

## Documentação

| Documento | Assunto |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, estrutura de pastas, decisões e seus porquês |
| [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md) | **Leia antes de escrever conteúdo ou código novo** |
| [`docs/RISKS.md`](docs/RISKS.md) | Riscos técnicos, com o estado de tratamento de cada um |

## A regra que organiza o código

O limite regulatório não é uma política que vive na cabeça das pessoas — ele é
imposto em três camadas:

1. **Tipos.** `AssetProfile` não tem campo de rentabilidade, nota ou opinião.
   Escrever a frase não compila.
2. **Schema.** O banco não tem coluna de performance. O que não é armazenado
   não vaza em relatório.
3. **Testes.** Um guardrail varre todo o conteúdo curado atrás de vocabulário
   de recomendação e quebra o CI quando encontra.

Detalhes e a checklist de conteúdo em [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md).

## Aviso

Este repositório contém decisões de engenharia, não parecer jurídico. O
enquadramento na Resolução CVM 19 e o texto do aviso legal merecem validação
por advogado especializado em mercado de capitais antes do lançamento.
