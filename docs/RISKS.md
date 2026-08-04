# Riscos técnicos

Levantados antes de escrever código, atualizados conforme o scaffold avançou.
Ordenados por impacto no produto, não por dificuldade de resolver.

---

## 1. O CNPJ não identifica o ativo — identifica a pessoa jurídica

**Impacto: alto. Contraria uma premissa do briefing.**

O briefing diz "sistema identifica cada ativo pelo CNPJ". Isso funciona para
fundos — FII, Fiagro, ETF e fundos em geral têm CNPJ próprio, com registro
público na CVM. Não funciona para o resto:

- **CDB, LCI, LCA, LC** não têm CNPJ. Quem tem é o banco emissor. O mesmo CNPJ
  aparece em todos os papéis daquela instituição, e nada nele distingue um CDB
  de uma LCI.
- **Ações e BDRs** são identificados por ticker e por ISIN. O CNPJ da companhia
  não é o identificador de negociação.
- **Tesouro Direto** não tem CNPJ por título; é dívida da União.
- **CRI e CRA** têm o CNPJ da securitizadora, que emite dezenas de séries
  diferentes sob o mesmo número.

**Como está tratado.** `classifyAsset` combina dois sinais — tipo da entidade
por trás do CNPJ e nome declarado pelo usuário — e devolve `confidence`
explícita. Confiança baixa marca `needsUserConfirmation` e a interface pede
confirmação em vez de exibir um palpite como fato.

**Consequência de produto.** Vale ajustar o texto do site: o CNPJ é usado para
identificar a instituição e, no caso de fundos, o próprio ativo. Prometer
identificação total por CNPJ gera expectativa que o dado público não sustenta.

**Próximo passo.** Ingerir os datasets abertos da CVM (`dados.cvm.gov.br`) para
resolver CNPJ de fundo com precisão real, e a base de CNPJ da Receita para
identificar instituições. Só aí a classificação de fundos passa de heurística a
consulta.

---

## 2. Conteúdo educativo desatualizado vira exposição regulatória

**Impacto: alto.**

As fichas afirmam regras de tributação, carência e cobertura do FGC. Essas
regras mudam por lei e por medida provisória — houve movimentação recente sobre
a isenção de LCI, LCA, CRI e CRA. Uma ficha errada é conteúdo informativo
incorreto sobre matéria regulada.

**Como está tratado.** Toda ficha tem `officialSources`, `TAX_NOTICE` avisa
que regras mudam, e `CATALOG_REVIEWED_AT` marca a última revisão editorial.

**Próximo passo.** Exibir a data de revisão na ficha, e um processo de revisão
com data marcada — não "quando alguém lembrar". Considerar um teste que falhe
quando o catálogo passar de N meses sem revisão.

---

## 3. Guardrail de linguagem não cobre copy escrita em JSX

**Impacto: médio. Dívida conhecida.**

`tests/compliance.test.ts` varre o catálogo educativo, os textos da política e
os racionais do classificador. Não varre string escrita direto em componente.
Hoje a copy da landing é revisada a olho, o que é exatamente o tipo de
dependência de atenção humana que o guardrail existe para eliminar.

**Próximo passo.** Extrair a copy das seções para módulos de conteúdo tipados e
incluí-los na varredura. Alternativa mais barata: um passo de CI que roda o
detector sobre o HTML renderizado da build.

---

## 4. Falso positivo e falso negativo no detector de linguagem

**Impacto: médio. Já observado na prática.**

O detector pegou dois falsos positivos no primeiro run, ambos pela mesma causa:
em português, "venda" e "compra" são substantivos além de imperativos, e
"preço de compra e de venda" é descrição legítima. O padrão foi ancorado em
posição de frase.

A direção oposta é mais perigosa: o detector é léxico, então não pega
recomendação implícita — "clientes com perfil parecido costumam concentrar
menos" não usa nenhuma palavra proibida e ainda assim orienta alocação.

**Como está tratado.** O teste inclui casos que *devem* ser detectados, para que
uma varredura quebrada não passe silenciosamente como "nenhuma violação".

**Próximo passo.** Revisão humana de conteúdo novo continua obrigatória. O
guardrail é rede de segurança, não substituto de revisão — e a Fase 2 vai
precisar disso com muito mais rigor.

---

## 5. Acássium News (Fase 2) processa texto de terceiros

**Impacto: alto quando a Fase 2 começar.**

Resumir notícias sobre os CNPJs da carteira significa publicar, dentro do
produto, texto que o time não escreveu. Uma manchete como "analistas veem
espaço para alta" é recomendação de terceiro; reproduzi-la sem cuidado importa o
risco regulatório para dentro de casa. Se o resumo for gerado por LLM, o risco
aumenta: modelos de linguagem produzem juízo de valor com naturalidade.

**Próximo passo.** Todo texto do pipeline de notícias precisa passar por
`findViolations` antes de sair, e o que falhar deve ser descartado, não editado
automaticamente. Preferir citação de manchete com link à geração de resumo
próprio.

---

## 6. Leitura de extrato em PDF (Fase 2)

**Impacto: alto, e é a razão de estar na Fase 2.**

Cada corretora formata o extrato de um jeito, muda o layout sem aviso, e uma
parte dos PDFs é imagem escaneada. Parser por corretora é manutenção
permanente; OCR erra dígito, e dígito errado em valor financeiro é erro grave e
silencioso.

**Recomendação.** Manter fora da Fase 1, como o briefing já prevê. Quando
chegar a hora: começar por duas ou três corretoras de maior volume, sempre com
tela de conferência antes de gravar, e nunca importar sem confirmação humana.

---

## 7. Custo do hero 3D em aparelho modesto

**Impacto: médio.**

Três.js no hero é o maior item do bundle e roda em telefone de entrada.
Landing pesada custa conversão.

**Como está tratado.** A cena é `dynamic` com `ssr: false`, fora do bundle
inicial; DPR limitado a 1.8; sem HDRI remota (o `Environment` renderiza
lightformers em memória, o que também evita quebra sob CSP restritiva);
`prefers-reduced-motion` desliga o loop de renderização de verdade; e ausência
de WebGL degrada para o gradiente do hero, sem tela quebrada.

**Próximo passo.** Medir em aparelho real e considerar não montar a cena abaixo
de uma largura mínima ou sob `navigator.connection.saveData`.

---

## 8. LGPD: carteira é dado financeiro sensível

**Impacto: alto.**

Composição de carteira revela patrimônio e vínculo com instituições. Vazamento
aqui é dano concreto, e o volume de dado é pequeno o bastante para não haver
desculpa técnica para tratá-lo mal.

**Já no scaffold.** Cabeçalhos de segurança em `next.config.ts` (HSTS,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`); `.env.example`
com `sslmode=require` e chave de criptografia de campo.

**Já implementado.** Exclusão de conta e dados pelo próprio titular, com
`onDelete: Cascade` verificado no banco — apagar o usuário levou junto os cinco
ativos e a sessão do teste; exportação em JSON pelo próprio titular, sem o hash
da senha; `robots: noindex, nocache` nas rotas autenticadas; senha em argon2id;
`Cache-Control: no-store, private` na rota de exportação.

**Pendente.** Criptografia em repouso dos campos sensíveis
(`declaredValueCents`, `institution`) — hoje protegidos por TLS em trânsito e
pelo controle de acesso do banco, mas legíveis por quem obtiver um dump. Falta
também expurgo automático de sessões expiradas e log de auditoria que registre
acesso sem duplicar o dado sensível.

---

## 9. Login sem limite de tentativas

**Impacto: alto. É a lacuna mais relevante do que já está de pé.**

Nada hoje limita quantas vezes alguém tenta entrar. Isso abre duas portas:
força bruta contra senha fraca, e enumeração de e-mails pelo cadastro — que,
diferente do login, precisa dizer que o e-mail já existe para recusar conta
duplicada.

**O que já mitiga.** O login devolve a mesma mensagem para e-mail inexistente e
para senha errada, e calcula um hash descartável quando o usuário não existe,
igualando o tempo de resposta dos dois caminhos — sem isso, a diferença de tempo
sozinha entregaria quais e-mails estão cadastrados. O argon2id com 19 MiB torna
cada tentativa cara. Nada disso substitui limitar tentativas.

**Próximo passo.** Limite por IP e por conta no login e no cadastro, com atraso
progressivo. Em Vercel, `@upstash/ratelimit` resolve sem infraestrutura extra.
Antes de qualquer usuário real, isto vem primeiro.

---

## 10. Autenticação implementada à mão

**Impacto: médio, com contenção deliberada.**

Escrever a própria autenticação é um clássico de tiro no pé, e não faço isso de
ânimo leve. A alternativa, porém, era depender de `next-auth@5.0.0-beta` na
camada que protege dado financeiro. O raciocínio completo está em
`docs/ARCHITECTURE.md`.

**Como está contido.** Escopo mínimo: sem OAuth, sem recuperação de senha — que
é onde mora a maioria das falhas dessa categoria — e sem 2FA. As partes difíceis
ficam com bibliotecas consolidadas: `jose` para assinar, `@node-rs/argon2` para
o hash. Não há criptografia inventada aqui. A sessão é revogável porque existe
como linha em banco, não só como token.

**Gatilho para migrar.** Login social, 2FA ou link mágico por e-mail. Qualquer
um dos três, e o custo de manter isso à mão passa a superar o de adotar Auth.js.
