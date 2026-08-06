#!/usr/bin/env node

/**
 * Monta a demonstração interativa em um arquivo HTML sozinho.
 *
 * O ponto do build é que a página use o DOMÍNIO REAL, e não uma cópia: o
 * esbuild empacota `demo/entry.ts`, que só reexporta o classificador, o
 * catálogo e a aritmética de carteira. Se o produto mudar, a demonstração muda
 * no próximo build — uma demonstração que reimplementa o sistema acaba
 * demonstrando outra coisa.
 *
 * As fontes são extraídas do próprio build do Next, que já as baixou e
 * auto-hospedou, e entram como data URI. Assim a página não depende de CDN
 * nenhuma e funciona offline.
 *
 * Uso:  npm run build && node demo/build.mjs
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "demo", "dist");
const OUT = join(OUT_DIR, "index.html");

/** Faces necessárias: display, corpo regular e negrito, e a mono técnica. */
const NEEDED = [
  ["Libre Caslon Display", "400"],
  ["Source Sans 3", "400"],
  ["Source Sans 3", "600"],
  ["IBM Plex Mono", "400"],
];

function findBuiltCss() {
  const dir = join(ROOT, ".next", "static", "chunks");
  if (!existsSync(dir)) return null;

  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".css")) continue;
    const contents = readFileSync(join(dir, file), "utf8");
    if (contents.includes("@font-face")) return { dir, contents };
  }
  return null;
}

function extractFonts() {
  const css = findBuiltCss();
  if (!css) {
    console.warn("· fontes não encontradas — rode `npm run build` antes. Seguindo com fallback.");
    return "";
  }

  const found = new Map();
  for (const block of css.contents.match(/@font-face\{[^}]*\}/g) ?? []) {
    const family = block.match(/font-family:([^;]+);/)?.[1]?.trim().replace(/"/g, "");
    const weight = block.match(/font-weight:(\d+)/)?.[1] ?? "400";
    const style = block.match(/font-style:(\w+)/)?.[1] ?? "normal";
    const src = block.match(/url\(([^)]+\.woff2)\)/)?.[1];
    const range = block.match(/unicode-range:([^;}]+)/)?.[1] ?? "";

    // O minificador comprime o subset latino para `U+??`.
    if (!family || !src || style !== "normal" || !range.startsWith("U+??")) continue;
    if (family.includes("Fallback")) continue;

    const key = `${family}|${weight}`;
    if (!found.has(key)) found.set(key, normalize(join(css.dir, src)));
  }

  return NEEDED.map(([family, weight]) => {
    const path = found.get(`${family}|${weight}`);
    if (!path || !existsSync(path)) {
      console.warn(`· face ausente: ${family} ${weight}`);
      return "";
    }
    const data = readFileSync(path).toString("base64");
    return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${data}) format("woff2")}`;
  }).join("\n");
}

const bundlePath = join(OUT_DIR, "domain.js");
mkdirSync(dirname(bundlePath), { recursive: true });

console.log("· empacotando o domínio real…");
execSync(
  `npx esbuild demo/entry.ts --bundle --format=iife --target=es2020 --outfile=${JSON.stringify(bundlePath)}`,
  { cwd: ROOT, stdio: "inherit" },
);

console.log("· embutindo fontes…");
const fonts = extractFonts();

const html = readFileSync(join(ROOT, "demo", "template.html"), "utf8")
  .replace("{{FONTS}}", () => fonts)
  .replace("{{DOMAIN}}", () => readFileSync(bundlePath, "utf8"));

if (html.includes("{{")) {
  console.error("Sobrou marcador não substituído no template.");
  process.exit(1);
}

writeFileSync(OUT, html);
console.log(`\nPronto: ${OUT} (${Math.round(Buffer.byteLength(html) / 1024)} KB)`);
console.log("Abra o arquivo direto no navegador — não precisa de servidor.\n");
