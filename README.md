# Acássium Invest

Site educativo sobre produtos de investimento do mercado brasileiro.

> **Conteúdo meramente informativo. Não constitui recomendação de investimento.**
> O site explica estruturas: o que cada produto é, quem paga o investidor, como
> funciona o resgate, qual a tributação e qual a garantia. Não recomenda, não
> classifica por mérito e não afirma rentabilidade — para isso, aponta sempre a
> fonte oficial.

## Rodar na sua máquina

Requer Node 22+. Não precisa de banco de dados nem de variável de ambiente.

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run verify   # typecheck + lint + testes
npm run build    # build estático de produção
```

## O que o site tem

A navegação tem três degraus, do vocabulário que a pessoa já tem até o documento
da emissão:

1. **Home** — o que o site é, e as seis categorias como porta de entrada
2. **Categoria** (`/categorias/renda-fixa`) — quais famílias de pagamento existem
   ali dentro, cada uma com o diagrama do caminho do dinheiro, e os produtos em
   cartões que respondem sempre às mesmas quatro perguntas
3. **Produto** (`/produtos/CDB`) — o verbete completo, com as fontes oficiais

Além disso:

- **36 produtos** organizados por *quem paga você*, em 14 famílias de pagamento:
  Tesouro, banco, empresa, carteira de recebíveis, fundo listado, fundo aberto,
  emissor no exterior, seguradora
- **Comparação de estruturas** lado a lado (`/comparar`), sem ordenar nem pontuar
- **Gráficos de estrutura** — cadeia de pagamento, composição da categoria e a
  tabela regressiva do IR
- **WhatsApp em todas as páginas**, porque a conversa é o destino do site

Tudo estático: sem banco, sem login, sem coleta de dados.

## Documentação

| Documento | Assunto |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, sistema de marca e decisões |
| [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md) | **Leia antes de escrever conteúdo novo** |
| [`docs/RISKS.md`](docs/RISKS.md) | Riscos conhecidos, com o estado de cada um |

## A regra que organiza o conteúdo

O limite regulatório é imposto em duas camadas, não confiado à memória de quem
escreve:

1. **Tipos.** `AssetProfile` não tem campo de rentabilidade, nota ou opinião.
   Escrever a frase não compila.
2. **Testes.** Um guardrail varre todo o catálogo atrás de vocabulário de
   recomendação e quebra o CI quando encontra.

Detalhes e a checklist de conteúdo em [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md).

## Aviso

Este repositório contém decisões de engenharia, não parecer jurídico. O
enquadramento na Resolução CVM 19 e o texto dos documentos legais merecem
validação por advogado especializado antes da publicação.
