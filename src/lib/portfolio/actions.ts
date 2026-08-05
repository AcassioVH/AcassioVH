"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { classifyAsset } from "@/domain/assets/classify";
import type { AssetClass } from "@/domain/assets/taxonomy";
import type { PortfolioAsset } from "@/domain/portfolio/analysis";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { decryptField, decryptOptional, encryptField, encryptOptional } from "@/lib/security/crypto";
import { assetSchema, fieldErrors } from "@/lib/validation";

export type AssetFormState = {
  readonly errors?: Record<string, string>;
  readonly message?: string;
};

/**
 * Carrega a carteira do usuário autenticado, decifrando na fronteira.
 *
 * O `where` sempre inclui `userId`. Não é redundância com a sessão: é o que
 * garante que um id de ativo adivinhado não devolva dado de outra pessoa.
 *
 * A ordenação é feita em memória porque `declaredValueCents` está cifrado —
 * ordenar criptograma no banco daria ordem alfabética de bytes aleatórios. Não
 * é perda real: a leitura sempre carrega a carteira inteira para agregar, e
 * carteira de pessoa física tem dezenas de itens, não milhões.
 */
export async function loadPortfolio(): Promise<PortfolioAsset[]> {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  const rows = await db.asset.findMany({ where: { userId: user.id } });

  return rows
    .map((row) => ({
      id: row.id,
      name: decryptField(row.name),
      cnpj: decryptOptional(row.cnpj),
      institution: decryptOptional(row.institution),
      // Centavos cabem com folga em Number — seguro até ~90 trilhões de reais.
      valueCents: Number(decryptField(row.declaredValueCents)),
      assetClass: row.assetClass as AssetClass,
      confidence: row.confidence,
      classConfirmedByUser: row.classConfirmedByUser,
      maturityDate: row.maturityDate,
    }))
    .sort((a, b) => b.valueCents - a.valueCents);
}

export async function createAssetAction(
  _previous: AssetFormState,
  formData: FormData,
): Promise<AssetFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  const parsed = assetSchema.safeParse({
    name: formData.get("name"),
    cnpj: formData.get("cnpj"),
    institution: formData.get("institution"),
    value: formData.get("value"),
    maturityDate: formData.get("maturityDate"),
    assetClass: formData.get("assetClass"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { name, cnpj, institution, value, maturityDate, assetClass } = parsed.data;

  const classification = classifyAsset({
    declaredName: name,
    cnpj: cnpj ?? undefined,
    userOverride: (assetClass as AssetClass | null) ?? undefined,
  });

  await db.asset.create({
    data: {
      userId: user.id,
      // Cifrados na fronteira: daqui para dentro do banco, nada legível.
      name: encryptField(name),
      cnpj: encryptOptional(cnpj),
      institution: encryptOptional(institution),
      declaredValueCents: encryptField(String(value)),
      maturityDate,
      assetClass: classification.assetClass,
      confidence: classification.confidence,
      // Escolher a classe manualmente já é a confirmação.
      classConfirmedByUser: assetClass !== null,
    },
  });

  revalidatePath("/carteira");
  return { message: "Ativo adicionado." };
}

/** Confirma ou corrige a classe sugerida pelo motor. */
export async function confirmClassAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  const id = formData.get("id");
  const assetClass = formData.get("assetClass");

  if (typeof id !== "string" || typeof assetClass !== "string") return;

  const classification = classifyAsset({
    declaredName: "",
    userOverride: assetClass as AssetClass,
  });

  // `updateMany` com userId no filtro: um id de outra pessoa não atualiza nada,
  // em vez de lançar erro que confirmaria a existência do registro.
  await db.asset.updateMany({
    where: { id, userId: user.id },
    data: {
      assetClass: classification.assetClass,
      confidence: "ALTA",
      classConfirmedByUser: true,
    },
  });

  revalidatePath("/carteira");
}

export async function deleteAssetAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await db.asset.deleteMany({ where: { id, userId: user.id } });

  revalidatePath("/carteira");
}
