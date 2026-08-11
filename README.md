# Acássium Invest

Site educativo sobre produtos de investimento do mercado brasileiro.

> **Conteúdo meramente informativo. Não constitui recomendação de investimento.**
> O site explica estruturas: o que cada produto é, para onde vai o seu dinheiro, como
> funciona o resgate, qual a tributação e qual a garantia. Não recomenda, não
> classifica por mérito e não afirma rentabilidade — para isso, aponta sempre a
> fonte oficial.

## Rodar na sua máquina

Requer Node 22+. Não precisa de banco de dados nem de variável de ambiente.

```bash
npm install
npm run dev      # http://localhost:3000
```

A única parte que pede configuração é o boletim de conjuntura (`/boletim`):
sem `ANTHROPIC_API_KEY` no ambiente, a página abre e informa que a apuração está
desligada, e o resto do site funciona normalmente. Ver `.env.example`.

```bash
npm run verify   # typecheck + lint + testes + build + varredura do HTML
npm run build    # build estático de produção
```

A varredura de conformidade roda sobre o HTML publicado, e não sobre o código:
é a única superfície em que nenhuma palavra escapa.

## O que o site tem

A navegação tem três degraus, do vocabulário que a pessoa já tem até o documento
da emissão:

1. **Home** — o que o site é, e as seis categorias como porta de entrada
2. **Categoria** (`/categorias/renda-fixa`) — para onde o dinheiro vai em cada
   destino, com o diagrama do caminho, e os produtos em cartões que respondem
   sempre às mesmas quatro perguntas
3. **Produto** (`/produtos/CDB`) — o verbete completo, com as fontes oficiais

A barra fixa carrega a navegação inteira — Início, Categorias, Instituições
financeiras e a busca — porque quase todo mundo entra por um verbete, vindo de
uma busca, e precisa do mapa ali em cima.

Além disso:

- **36 produtos** organizados por *para onde vai o seu dinheiro*, em 14 destinos:
  Tesouro, banco, empresa, carteira de recebíveis, fundo listado, fundo aberto,
  emissor no exterior, seguradora
- **11 tipos de instituição** (`/instituicoes`) — o que cada tipo pode emitir,
  quem o autoriza a funcionar e qual garantia se aplica. Tipos, nunca
  instituições nomeadas: descrever o Banco X é análise de emissor. Para olhar uma
  instituição concreta, a página entrega o endereço de quem a supervisiona
- **Busca** por `⌘K`, `/` ou pelo botão da barra — pela sigla, pelo nome, por
  pelo destino, ou por palavra que a pessoa usa mas o catálogo não ("dólar" acha o
  fundo cambial)
- **Comparação de estruturas** lado a lado (`/comparar`), sem ordenar nem pontuar
- **Gráficos de estrutura** — cadeia de pagamento, composição da categoria e a
  tabela regressiva do IR
- **WhatsApp em todas as páginas**, porque a conversa é o destino do site
- **Sitemap, robots e dados estruturados** — o site existe para ser encontrado
- **Cartão de compartilhamento por página**, gerado no build: o link de um
  verbete mandado no WhatsApp chega com título, resumo e o destino do dinheiro
- **Boletim de conjuntura** (`/boletim`) — leitura diária do noticiário
  econômico, apurada ao vivo em fontes públicas, com veículo e data em cada
  afirmação. É ferramenta de trabalho do assessor, não conteúdo do catálogo:
  fica fora da navegação e fora do índice de busca, e todo texto gerado passa
  pela mesma varredura de conformidade do resto do site antes de aparecer

Sem banco, sem login, sem coleta de dados. Todo o conteúdo é estático, com uma
exceção declarada: `/boletim` conversa com `/api/boletim`, a única rota de
servidor do projeto — ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

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
   recomendação e quebra o CI quando encontra. Depois do build, outra varredura
   passa pelo HTML publicado, onde nenhuma palavra escapa.
3. **Runtime.** O texto que o boletim gera não passa por nenhuma das duas — ele
   nasce depois do último teste. Por isso ele atravessa a mesma lista de
   padrões em tempo de execução, e o item em violação é descartado antes de
   virar HTML.

Detalhes e a checklist de conteúdo em [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md).

## Aviso

Este repositório contém decisões de engenharia, não parecer jurídico. O
enquadramento na Resolução CVM 19 e o texto dos documentos legais merecem
validação por advogado especializado antes da publicação.
