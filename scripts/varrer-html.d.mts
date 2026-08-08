/**
 * Tipos da varredura de HTML.
 *
 * O script é JavaScript puro de propósito — roda depois do build, sem etapa de
 * compilação. Esta declaração existe só para o teste de sincronia poder
 * importá-lo com tipos, em vez de silenciar o erro com `any`.
 */

/** Par de expressão e motivo, espelhando `FORBIDDEN_PATTERNS` da política. */
export declare const PROIBIDO: readonly (readonly [RegExp, string])[];

/** Frases em que o próprio site declara o seu limite, ignoradas na varredura. */
export declare const DECLARACOES_DA_POLITICA: readonly string[];

/** Varre `.next/server/app`; encerra o processo com código 1 se achar violação. */
export declare function varrer(): Promise<void>;
