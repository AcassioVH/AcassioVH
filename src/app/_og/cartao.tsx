import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * O cartão que aparece quando alguém compartilha um link.
 *
 * Vale mais aqui do que na maioria dos sites, e por um motivo concreto: o canal
 * deste negócio é o WhatsApp. Quando o assessor manda o link de um verbete para
 * um cliente, o que chega primeiro é este cartão — antes de qualquer texto que
 * ele escreva. Sem cartão, o link chega como uma URL crua e parece spam.
 *
 * Desenhado na marca, com as mesmas três vozes e a mesma escala de
 * profundidade. Como o cartão é uma imagem estática de 1200×630, a atmosfera é
 * feita só de gradiente: partícula em 630px de altura vira sujeira, não água.
 *
 * As fontes são lidas do disco no build. Nada de rede aqui: uma imagem que
 * depende de baixar fonte falha silenciosamente e o cartão sai com a fonte
 * errada, defeito que só aparece depois de publicado.
 */

const DIR = join(process.cwd(), "src/app/_og");

async function faces() {
  const [display, corpo, mono] = await Promise.all([
    readFile(join(DIR, "caslon.ttf")),
    readFile(join(DIR, "sans.ttf")),
    readFile(join(DIR, "mono.ttf")),
  ]);
  return [
    { name: "Caslon", data: display, weight: 400 as const, style: "normal" as const },
    { name: "Sans", data: corpo, weight: 300 as const, style: "normal" as const },
    { name: "Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

export const CARTAO = { width: 1200, height: 630 };

/** A marca: as duas hastes, com os pés na mesma linha de base. */
function Marca({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M38.45 30 L59.45 30 L86.5 97 L65.5 97 Z" fill="#e3bc7e" />
      <path d="M48.5 3 L69.5 3 L34.5 97 L13.5 97 Z" fill="#f0f2f1" />
    </svg>
  );
}

export async function cartao({
  eyebrow,
  titulo,
  descricao,
  accent = "#e3bc7e",
}: {
  eyebrow: string;
  titulo: string;
  descricao?: string;
  accent?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(150deg, #12333b 0%, #0c2530 38%, #081a21 72%, #050c11 100%)",
          fontFamily: "Caslon",
        }}
      >
        {/* A réstia de luz vinda de cima: a mesma figura do topo do site. */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: 520,
            width: 420,
            height: 700,
            transform: "skewX(-11deg)",
            background: "linear-gradient(174deg, rgba(227,188,126,.20), rgba(227,188,126,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Marca />
          <span style={{ fontSize: 34, letterSpacing: 3, color: "#f0f2f1" }}>ACÁSSIUM</span>
          <span
            style={{
              fontFamily: "Mono",
              fontSize: 16,
              letterSpacing: 7,
              color: "#c9954a",
              marginTop: 6,
            }}
          >
            INVEST
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Mono",
              fontSize: 19,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: accent,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontSize: titulo.length > 34 ? 62 : 78,
              lineHeight: 1.05,
              color: "#f0f2f1",
              marginTop: 22,
              maxWidth: 960,
            }}
          >
            {titulo}
          </span>
          {descricao ? (
            <span
              style={{
                fontFamily: "Sans",
                fontSize: 27,
                lineHeight: 1.45,
                color: "#a8b7ba",
                marginTop: 24,
                maxWidth: 880,
              }}
            >
              {descricao}
            </span>
          ) : null}
        </div>

        <span style={{ fontFamily: "Mono", fontSize: 16, letterSpacing: 2, color: "#6c7e82" }}>
          CONTEÚDO INFORMATIVO. NÃO CONSTITUI RECOMENDAÇÃO DE INVESTIMENTO.
        </span>
      </div>
    ),
    { ...CARTAO, fonts: await faces() },
  );
}
