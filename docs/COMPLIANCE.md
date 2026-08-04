# Conformidade — como a regra vira código

> **Regra inegociável.** O sistema descreve a composição da carteira informada
> pelo usuário. Não recomenda, não avalia, não afirma rentabilidade.

Este documento é para quem for escrever conteúdo ou código novo no projeto.

## A distinção que importa

Toda decisão de conteúdo se resume a uma pergunta:

> Isto descreve uma característica estrutural do **tipo** de ativo, ou emite
> juízo sobre um ativo **específico**?

| Pode | Não pode |
|---|---|
| "LCI tem carência mínima definida em norma." | "LCI é boa para quem não precisa do dinheiro." |
| "Debênture não conta com cobertura do FGC." | "Debênture é mais arriscada que CDB." |
| "O rendimento é creditado na data de aniversário." | "A poupança rende pouco." |
| "Confira a rentabilidade no Status Invest." | "Esse fundo rendeu 12% no ano." |
| "Você tem 38% em uma única instituição." | "Você está concentrado demais." |

A última linha é a mais sutil e a mais fácil de errar. Somar e agrupar é
descrição. Dizer que o resultado da soma é excessivo é avaliação — mesmo sem
usar nenhuma palavra proibida.

## As três camadas

### 1. Tipos

`AssetProfile` (`src/domain/assets/profile-types.ts`) não tem campo de
rentabilidade, nota, score, nível de risco ou adequação a perfil. A ausência é
o mecanismo: não há onde escrever a frase.

Rentabilidade sai por um motivo próprio. Ela é objetiva, mas afirmá-la nos
tornaria responsáveis pela sua exatidão e atualidade. Por isso só aparece como
link em `officialSources` — o número vem de quem tem autoridade para publicá-lo.

**Ao adicionar um campo**, aplique o teste da seção anterior. Se o campo só faz
sentido preenchido com juízo de valor, ele não entra.

### 2. Schema

O banco não guarda performance, cotação histórica nem retorno calculado. O que
não é armazenado não vaza em relatório, não é exportado por engano e não vira
base para uma feature futura que ninguém revisou.

### 3. Testes

`tests/compliance.test.ts` roda em cada commit e varre o catálogo educativo, os
textos da política e os racionais do classificador atrás do vocabulário de
`FORBIDDEN_PATTERNS`. Violação quebra o CI.

O teste também verifica o caminho inverso: exemplos que **devem** ser
detectados. Sem isso, um detector quebrado passaria como "nenhuma violação
encontrada", que é o pior modo de falha possível para um guardrail.

**Cobertura atual:** catálogo, política, classificador.
**Fora da varredura:** copy escrita direto em JSX (ver `docs/RISKS.md`, risco 3).

## Sobre falsos positivos

A lista de padrões é conservadora de propósito. Falso positivo custa reescrever
uma frase; falso negativo custa exposição regulatória.

Quando o detector acusar texto legítimo, a ordem de preferência é:

1. **Reescrever a frase.** Quase sempre é possível, e o texto costuma sair
   melhor.
2. **Ancorar o padrão com mais precisão** — foi o que fizemos com os
   imperativos, que agora exigem posição de frase porque "venda" e "compra"
   também são substantivos em português.
3. **Excluir o caso pontualmente**, com comentário explicando por quê. Só o
   `DISCLAIMER_FULL` faz isso hoje, e por um motivo específico: ele usa
   "recomendação" para negá-la.

Nunca afrouxe um padrão global para calar um caso isolado.

## Antes de publicar conteúdo novo

- [ ] Descreve o tipo de ativo, não o ativo específico do usuário
- [ ] Nenhum adjetivo avaliativo (bom, ruim, seguro, arriscado, ideal)
- [ ] Nenhum número de rentabilidade — só link para fonte oficial
- [ ] Nenhuma comparação entre classes de ativo
- [ ] Ao menos uma fonte oficial em https
- [ ] `npm test` passa
- [ ] Revisão humana feita — o guardrail é rede, não substituto

## Base regulatória

O desenho se apoia na exceção da **Resolução CVM 19** para relatórios puramente
descritivos de composição de carteira, sem orientação. A exceção depende de o
relatório permanecer descritivo — é por isso que o limite é estrutural aqui, e
não uma política escrita numa página que ninguém relê.

Independentemente disso, o aviso legal aparece em toda tela relevante via o
componente `Disclaimer`, com texto único vindo de
`src/domain/compliance/policy.ts`.

> Este documento descreve decisões de engenharia. Não é parecer jurídico — o
> texto do aviso legal e o enquadramento regulatório merecem validação por
> advogado especializado em mercado de capitais antes do lançamento.
