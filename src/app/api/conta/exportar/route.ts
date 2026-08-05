import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { decryptField, decryptOptional } from "@/lib/security/crypto";

/**
 * Exportação de dados pessoais — LGPD art. 18, direito à portabilidade.
 *
 * JSON, porque o direito é a formato legível por máquina, não a um PDF que a
 * pessoa não consegue reimportar em lugar nenhum.
 *
 * O hash da senha fica de fora de propósito: é dado nosso sobre a credencial,
 * não dado do titular, e exportá-lo só criaria uma cópia offline atacável.
 */
export async function GET() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      termsAcceptedAt: true,
      assets: {
        select: {
          name: true,
          cnpj: true,
          institution: true,
          declaredValueCents: true,
          declaredAt: true,
          assetClass: true,
          confidence: true,
          classConfirmedByUser: true,
          maturityDate: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
  }

  const payload = {
    exportadoEm: new Date().toISOString(),
    aviso:
      "Estes são todos os dados pessoais que a Acássium Invest armazena sobre você. " +
      "Não guardamos rentabilidade, cotação ou histórico de preço.",
    conta: {
      id: user.id,
      nome: user.name,
      email: user.email,
      criadaEm: user.createdAt.toISOString(),
      termosAceitosEm: user.termsAcceptedAt.toISOString(),
    },
    // Decifrados aqui: a exportação é para o próprio titular, e entregar
    // criptograma no lugar dos dados esvaziaria o direito à portabilidade.
    ativos: user.assets.map((asset) => ({
      nome: decryptField(asset.name),
      cnpj: decryptOptional(asset.cnpj),
      instituicao: decryptOptional(asset.institution),
      valorDeclaradoCentavos: decryptField(asset.declaredValueCents),
      valorDeclaradoEm: asset.declaredAt.toISOString(),
      classe: asset.assetClass,
      confiancaDaClassificacao: asset.confidence,
      classeConfirmadaPeloUsuario: asset.classConfirmedByUser,
      vencimento: asset.maturityDate?.toISOString() ?? null,
      adicionadoEm: asset.createdAt.toISOString(),
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="acassium-meus-dados.json"',
      // Dado sensível não deve ficar em cache de navegador ou intermediário.
      "Cache-Control": "no-store, private",
    },
  });
}
