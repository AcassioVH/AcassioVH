# Acássium Invest

Plataforma que recebe a carteira de investimentos do cliente e devolve uma
visão organizada e didática dela.

> **Conteúdo meramente informativo. Não constitui recomendação de
> investimento.** O sistema descreve a composição da carteira informada pelo
> usuário. Não recomenda, não avalia ativos e não afirma rentabilidade — para
> isso, aponta sempre para a fonte oficial.

## Começando

Requer Node 22+ e um PostgreSQL acessível.

```bash
npm install
cp .env.example .env.local   # preencha DATABASE_URL, AUTH_SECRET e FIELD_ENCRYPTION_KEY
npm run db:migrate           # cria o schema
npm run dev                  # http://localhost:3000
```

`AUTH_SECRET` e `FIELD_ENCRYPTION_KEY` precisam de no mínimo 32 bytes — gere
cada uma com `openssl rand -base64 32`. A aplicação recusa subir sem elas, de
propósito.

```bash
npm run verify     # typecheck + lint + testes
npm test           # só os testes (inclui o guardrail de conformidade)
npm run build      # build de produção
npm run db:studio  # inspecionar o banco
```

## Estado atual

**Fase 1 completa**, verificada ponta a ponta contra um PostgreSQL real:

- Landing page — hero 3D, composição, fichas, segurança, limite e contato
- Cadastro, login, logout e proteção de rotas
- Entrada manual de ativos com máscara e validação de CNPJ
- Motor de classificação que pede confirmação quando a confiança é baixa
- Dashboard de composição por classe e por instituição
- Segurança e Estrutura: cobertura do FGC por instituição e calendário de vencimentos
- Ficha educativa por classe, cobrindo 17 classes de ativo
- LGPD: exportar dados em JSON e excluir conta com cascata verificada
- Limite de tentativas de login e cadastro, por conta e por IP
- Criptografia em repouso dos campos sensíveis da carteira (AES-256-GCM)
- 82 testes automatizados, incluindo o guardrail de conformidade

**Antes de produção**, o item operacional que falta não é código: a chave
`FIELD_ENCRYPTION_KEY` precisa de cópia em cofre de segredos e de um
procedimento de restauração que a inclua. Perdê-la significa perder toda a
carteira de todos os usuários, de forma irreversível — ver
[`docs/RISKS.md`](docs/RISKS.md), risco 11.

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
