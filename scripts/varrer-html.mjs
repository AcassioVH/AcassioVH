/**
 * Varredura de conformidade sobre o HTML publicado.
 *
 * `tests/compliance.test.ts` varre o catálogo e a navegação, que são dados
 * tipados. O que ele nunca alcançou é a copy escrita direto em componente — os
 * títulos das seções, as listas do "o que você não encontra", o texto das
 * chamadas. Era a dívida nº 3 de `docs/RISKS.md`, e ela crescia a cada página
 * nova.
 *
 * O site é estático, então existe uma superfície onde nada escapa: o HTML
 * gerado. Toda palavra que chega ao leitor está ali, tenha vindo do catálogo,
 * de um componente ou de uma página escrita ontem. Varrer a saída fecha a
 * lacuna inteira, inclusive para páginas que ainda não foram escritas.
 *
 * Roda depois do build, no mesmo comando, para que ninguém precise lembrar.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";

const RAIZ = ".next/server/app";

/**
 * Os mesmos padrões da política, reescritos aqui em JavaScript puro.
 *
 * Duplicação consciente: este script roda fora do TypeScript, depois do build,
 * e importar o domínio exigiria uma etapa de compilação só para isto. O teste
 * `mantém a varredura de HTML em sincronia com a política` compara as duas
 * listas e falha se alguém mexer numa e esquecer da outra.
 */
export const PROIBIDO = [
  [/\brecomend/i, "recomendação explícita"],
  [/\bindicamos\b/i, "recomendação explícita"],
  [/\bsugerimos\b/i, "recomendação explícita"],
  [/\baconselh/i, "aconselhamento"],
  [/\bvocê deve (comprar|vender|investir|aplicar|migrar|realocar)/i, "instrução de alocação"],
  [/(^|[.!?;:]\s+|\bnão\s+)(compre|venda|invista|aplique|realoque|migre)\b/i, "imperativo de alocação"],
  [/\bmelhor (ativo|investimento|opção|escolha|alternativa)/i, "juízo comparativo"],
  [/\bpior (ativo|investimento|opção|escolha|alternativa)/i, "juízo comparativo"],
  [/\bvale a pena\b/i, "juízo de valor"],
  [/\bboa (opção|escolha|alternativa|aplicação)/i, "juízo de valor"],
  [/\bmá (opção|escolha|alternativa|aplicação)/i, "juízo de valor"],
  [/\bativo (bom|ruim|excelente|péssimo)\b/i, "qualificação de ativo"],
  [/\brentabilidade de \d/i, "afirmação de rentabilidade"],
  [/\brend(e|eu|em|eram|er|erá|erão|ia|iam|endo)\s+\d/i, "afirmação de rentabilidade"],
  [/\bretorno (esperado|estimado|previsto|projetado)/i, "projeção de retorno"],
  [/\bganho (garantido|certo)/i, "promessa de retorno"],
  [/\bvai (subir|cair|valorizar|desvalorizar)/i, "previsão de preço"],
  [/\btendência de (alta|baixa)/i, "previsão de preço"],
  [/\boportunidade\b/i, "linguagem de indução"],
  [/\bideal para (seu|sua|o seu|a sua) perfil/i, "adequação de perfil"],
  [/\bmais seguro que\b/i, "comparação de risco"],
  [/\bsem risco\b/i, "afirmação sobre risco"],
  [/\bgarantia de (lucro|ganho|retorno)/i, "promessa de retorno"],
];

/**
 * As frases em que o site declara o próprio limite.
 *
 * O aviso legal contém, por necessidade, a palavra "recomendação" — é ele que
 * declara que o site NÃO recomenda. Negar a própria negação seria absurdo.
 *
 * São trechos literais, e não expressões regulares frouxas: um `/não
 * recomenda[^.]*\./` engoliria qualquer frase começada assim, inclusive uma que
 * viesse a dizer algo indevido depois. Aqui só sai do texto o que foi escrito
 * de propósito, palavra por palavra.
 *
 * O teste `sincronia entre a política e a varredura de HTML` confere que cada
 * um destes trechos ainda existe no domínio — se a política mudar e este
 * arquivo não, o CI avisa.
 */
export const DECLARACOES_DA_POLITICA = [
  "Conteúdo meramente informativo. Não constitui recomendação de investimento.",
  "não constitui recomendação de investimento",
  "Não recomendamos, avaliamos ou sugerimos a compra, venda ou realocação de qualquer ativo",
  "Não recomenda produtos, não classifica por qualidade",
  "não presta consultoria, análise ou recomendação de valores mobiliários",
  "Sem recomendação, sem ranking, sem promessa de retorno",
  "Recomendação de compra",
  "Não indica o que comprar, manter ou vender",
  "Alerta de urgência ou oportunidade",
  "não recomenda, não classifica por mérito",
];

/** Trata a frase como literal dentro de uma expressão regular. */
function escapar(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Tira marcação, scripts e dados embutidos: sobra o que a pessoa lê. */
function textoVisivel(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ");
}

async function paginas(dir) {
  const achados = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const caminho = join(dir, item.name);
    if (item.isDirectory()) achados.push(...(await paginas(caminho)));
    else if (item.name.endsWith(".html")) achados.push(caminho);
  }
  return achados;
}

/**
 * A varredura em si. Exportada para que o teste possa conferir as listas sem
 * disparar a leitura do build, que pode nem existir quando os testes rodam.
 */
export async function varrer() {
const arquivos = await paginas(RAIZ).catch(() => []);
if (arquivos.length === 0) {
  console.error(`Nenhum HTML em ${RAIZ}. Rode "npm run build" antes da varredura.`);
  process.exit(1);
}

const violacoes = [];
for (const arquivo of arquivos) {
  let texto = textoVisivel(await readFile(arquivo, "utf8"));
  // A mesma frase aparece iniciando período ("Não constitui…") e no meio dele
  // ("…, não constitui…"), então a remoção precisa ignorar a caixa.
  for (const declaracao of DECLARACOES_DA_POLITICA) {
    texto = texto.replace(new RegExp(escapar(declaracao), "gi"), " ");
  }

  for (const [padrao, motivo] of PROIBIDO) {
    const achado = padrao.exec(texto);
    if (!achado) continue;
    const inicio = Math.max(0, achado.index - 60);
    violacoes.push({
      arquivo: arquivo.replace(`${RAIZ}/`, ""),
      motivo,
      trecho: texto.slice(inicio, achado.index + achado[0].length + 60).trim(),
    });
  }
}

if (violacoes.length > 0) {
  console.error(`\nVocabulário de recomendação no HTML publicado (${violacoes.length}):\n`);
  for (const v of violacoes) {
    console.error(`  ${v.arquivo}\n    ${v.motivo}: …${v.trecho}…\n`);
  }
  process.exit(1);
}

  console.log(`Varredura de conformidade: ${arquivos.length} páginas, nenhuma violação.`);
}

// Só varre quando chamado direto; importado, expõe as listas e mais nada.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await varrer();
}
