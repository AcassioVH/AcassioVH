# Como testar o sistema

Guia para rodar a Acássium Invest na sua máquina, sem deploy e sem contratar
nada. Leva uns dez minutos na primeira vez.

> Tudo o que você fizer aqui fica no seu computador. Nenhum dado sai da máquina,
> e a carteira de demonstração é fictícia.

---

## O que você precisa instalar

| Programa | Para quê | Onde baixar |
|---|---|---|
| **Node.js 22 ou superior** | rodar a aplicação | [nodejs.org](https://nodejs.org) — baixe a versão LTS |
| **Docker Desktop** | rodar o banco de dados | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Git** | baixar o código | [git-scm.com](https://git-scm.com) |

Se você já tem um PostgreSQL instalado, o Docker é dispensável — veja
"Sem Docker" no fim.

---

## Os quatro comandos

Abra o terminal e rode, um de cada vez:

```bash
git clone https://github.com/AcassioVH/AcassioVH.git acassium
cd acassium
git checkout claude/acassium-invest-platform-2niix5
npm install
```

Suba o banco de dados:

```bash
docker compose up -d
```

Prepare o ambiente. Este comando cria as chaves de segurança, monta as tabelas e
cria uma carteira de demonstração com sete ativos:

```bash
npm run preparar
```

Ligue a aplicação:

```bash
npm run dev
```

Abra **http://localhost:3000** no navegador.

---

## A conta de demonstração

Já vem uma carteira montada, para você ver o sistema com dados dentro:

```
E-mail:  demo@acassium.com.br
Senha:   carteira-de-demonstracao
```

São sete ativos, R$ 635.000, escolhidos para exercitar o que o produto faz de
mais interessante. Repare em três coisas:

1. **HGLG11 e PETR4 aparecem em "a confirmar".** Não é falha: ticker terminado
   em 11 pode ser FII, Fiagro, ETF ou unit, e o sistema prefere perguntar a
   chutar. É o comportamento que define o produto.

2. **A cobertura do FGC acusa R$ 30.000 acima do limite** no Banco Master, que
   tem CDB e LCI somando R$ 280.000. É subtração de dois fatos — o que você
   declarou e o teto vigente —, não conselho.

3. **Nenhuma tela mostra rentabilidade.** Não é omissão: essa coluna não existe
   no banco. Onde faria sentido, há um link para a fonte oficial.

Você também pode criar a sua própria conta e informar ativos de verdade. Fica
tudo na sua máquina.

---

## Testando a recuperação de senha

Sem provedor de e-mail configurado, **o e-mail é escrito no terminal** onde o
`npm run dev` está rodando. Peça a recuperação em "Esqueci minha senha" e volte
ao terminal: o link completo estará lá, dentro de uma moldura.

Isso vale só para testes. Em produção o sistema recusa subir sem a chave de
envio configurada — um "esqueci minha senha" que não envia nada é pior que um
que recusa o pedido, porque o usuário fica esperando.

---

## Como parar e recomeçar

```bash
# parar a aplicação: Ctrl+C no terminal do npm run dev

docker compose stop     # parar o banco, mantendo os dados
docker compose down -v  # apagar o banco e os dados, para começar do zero
```

Depois de um `down -v`, rode `docker compose up -d` e `npm run preparar` de novo.

Para recriar só a carteira de demonstração, sem apagar sua conta:

```bash
npm run db:seed
```

---

## Ver o banco por dentro

```bash
npm run db:studio
```

Abre uma interface no navegador com as tabelas. **Vale a pena olhar a tabela
`assets`:** nome, CNPJ, instituição e valor aparecem como texto ilegível, porque
são cifrados antes de chegar ao banco. É assim que fica um vazamento de dump.

---

## Sem Docker

Se você já tem PostgreSQL na máquina, crie um banco e ajuste a conexão:

```bash
createdb acassium
```

Abra o arquivo `.env.local` (criado pelo `npm run preparar`) e ajuste a linha
`DATABASE_URL` para apontar ao seu banco. Depois rode `npm run preparar`
novamente.

---

## Se algo der errado

| Sintoma | O que fazer |
|---|---|
| `Não consegui falar com o banco de dados` | O Docker Desktop está aberto? Rode `docker compose up -d` e tente de novo. |
| `port is already allocated` | Algo já usa a porta 5433. Pare o outro serviço ou mude a porta em `docker-compose.yml`. |
| `AUTH_SECRET ausente` | Apague o arquivo `.env.local` e rode `npm run preparar` de novo. |
| Página em branco ou erro estranho | Pare o `npm run dev`, apague a pasta `.next` e rode de novo. |

Se travar em outro ponto, copie a mensagem de erro inteira do terminal — ela
costuma dizer exatamente o que falta.
