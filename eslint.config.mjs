import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 já publica configuração flat pronta nos subcaminhos, e
 * cada um deles exporta o array direto. Não usamos FlatCompat aqui: além de
 * desnecessário, ele quebra ao serializar o plugin do React, que tem
 * referências circulares.
 */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default config;
