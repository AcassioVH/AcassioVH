/**
 * Limite de uso da apuração.
 *
 * A rota do boletim é o primeiro endereço deste site que **gasta dinheiro por
 * requisição**: cada boletim são nove chamadas a um modelo, com busca web em
 * sete delas. Uma rota assim, aberta na internet sem limite, é um cartão de
 * crédito com o número na calçada — não é hipótese de ataque sofisticado,
 * basta alguém segurar o F5.
 *
 * Duas contenções, porque protegem de coisas diferentes:
 *
 * - **Por origem** — impede que um visitante sozinho consuma a cota do dia.
 * - **Global** — impede que muitos visitantes façam isso somados, que é o caso
 *   em que o limite por origem não ajuda em nada.
 *
 * A contagem vive em memória do processo, e isso tem consequência: em deploy
 * serverless, cada instância conta a sua parte, então o teto real é o teto
 * multiplicado pelo número de instâncias vivas. Serve para conter acidente e
 * curiosidade, não para conter ataque distribuído. A contenção que de fato
 * garante o gasto é a cota da chave de API, definida no painel da Anthropic —
 * está anotado em `docs/RISKS.md`.
 */

export type Veredito =
  | { readonly permitido: true }
  | { readonly permitido: false; readonly esperarSegundos: number };

export type Regra = {
  /** Quantas apurações cabem na janela. */
  readonly maximo: number;
  readonly janelaMs: number;
};

export type Limitador = {
  /** Consome uma vaga se houver. Chamar apenas quando a apuração vai mesmo rodar. */
  registrar(origem: string, agora?: number): Veredito;
};

/** Uma apuração inteira são ~9 chamadas; o teto é contado em chamadas. */
export const POR_ORIGEM: Regra = { maximo: 30, janelaMs: 15 * 60 * 1000 };
export const GLOBAL: Regra = { maximo: 300, janelaMs: 60 * 60 * 1000 };

/** Teto de origens rastreadas. Sem ele, o mapa é um vazamento de memória com IPs. */
const MAX_ORIGENS = 5_000;

function dentroDaJanela(marcas: readonly number[], agora: number, janelaMs: number): number[] {
  return marcas.filter((marca) => agora - marca < janelaMs);
}

function avaliar(marcas: number[], agora: number, regra: Regra): Veredito {
  if (marcas.length < regra.maximo) return { permitido: true };

  const maisAntiga = marcas[0] ?? agora;
  const restante = regra.janelaMs - (agora - maisAntiga);
  return { permitido: false, esperarSegundos: Math.max(1, Math.ceil(restante / 1000)) };
}

export function criarLimitador(
  porOrigem: Regra = POR_ORIGEM,
  global: Regra = GLOBAL,
): Limitador {
  const porChave = new Map<string, number[]>();
  let globais: number[] = [];

  return {
    registrar(origem, agora = Date.now()) {
      globais = dentroDaJanela(globais, agora, global.janelaMs);
      const vereditoGlobal = avaliar(globais, agora, global);
      if (!vereditoGlobal.permitido) return vereditoGlobal;

      const marcas = dentroDaJanela(porChave.get(origem) ?? [], agora, porOrigem.janelaMs);
      const veredito = avaliar(marcas, agora, porOrigem);
      if (!veredito.permitido) {
        porChave.set(origem, marcas);
        return veredito;
      }

      // Só agora a vaga é consumida: uma chamada barrada não conta contra o
      // limite, senão quem insiste nunca sai do bloqueio.
      marcas.push(agora);
      globais.push(agora);

      if (!porChave.has(origem) && porChave.size >= MAX_ORIGENS) {
        // Mapa cheio: descarta a origem mais antiga a entrar. Map preserva a
        // ordem de inserção, então a primeira chave é a mais velha.
        const maisVelha = porChave.keys().next();
        if (!maisVelha.done) porChave.delete(maisVelha.value);
      }
      porChave.set(origem, marcas);

      return { permitido: true };
    },
  };
}
