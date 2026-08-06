"use client";

import { useActionState, useState } from "react";

import { Field, SelectField, SubmitButton } from "@/components/ui/Field";
import { maskCnpjInput } from "@/domain/cnpj/cnpj";
import { profileFor } from "@/domain/assets/profiles";
import { ASSET_CLASSES } from "@/domain/assets/taxonomy";
import { createAssetAction, type AssetFormState } from "@/lib/portfolio/actions";

const EMPTY: AssetFormState = {};

/** Classes oferecidas na seleção manual, sem o marcador interno de "não classificado". */
const SELECTABLE_CLASSES = ASSET_CLASSES.filter(
  (assetClass) => assetClass !== "NAO_CLASSIFICADO",
);

export function AssetForm() {
  const [state, action, pending] = useActionState(createAssetAction, EMPTY);
  const [cnpj, setCnpj] = useState("");

  return (
    <form action={action} className="space-y-6">
      {state.message ? (
        <p
          role="status"
          className="border border-st-identified/45 bg-st-identified/[0.07] px-4 py-3 text-sm text-st-identified"
        >
          {state.message}
        </p>
      ) : null}

      <Field
        label="Nome do ativo"
        name="name"
        required
        placeholder="CDB Banco Exemplo 2027"
        error={state.errors?.name}
        hint="Use o nome como aparece no seu extrato — é por ele que identificamos o tipo."
      />

      <Field
        label="Valor declarado"
        name="value"
        required
        inputMode="decimal"
        placeholder="10.000,00"
        error={state.errors?.value}
        hint="O valor que você tem hoje nesse ativo, como você o conhece."
      />

      <Field
        label="CNPJ (opcional)"
        name="cnpj"
        value={cnpj}
        onChange={(event) => setCnpj(maskCnpjInput(event.target.value))}
        inputMode="numeric"
        placeholder="00.000.000/0001-91"
        error={state.errors?.cnpj}
        hint="Fundos têm CNPJ próprio. Em CDB, LCI e LCA, o CNPJ é o da instituição emissora."
      />

      <Field
        label="Instituição (opcional)"
        name="institution"
        placeholder="Banco Exemplo"
        error={state.errors?.institution}
        hint="Usada para calcular a concentração e a cobertura do FGC por instituição."
      />

      <Field
        label="Vencimento (opcional)"
        name="maturityDate"
        type="date"
        error={state.errors?.maturityDate}
        hint="Deixe em branco para ativos sem data de vencimento, como ações e fundos."
      />

      <SelectField
        label="Classe do ativo (opcional)"
        name="assetClass"
        defaultValue=""
        error={state.errors?.assetClass}
        hint="Deixe em automático para identificarmos pelo nome e pelo CNPJ."
      >
        <option value="">Identificar automaticamente</option>
        {SELECTABLE_CLASSES.map((assetClass) => (
          <option key={assetClass} value={assetClass}>
            {profileFor(assetClass).label} — {profileFor(assetClass).fullName}
          </option>
        ))}
      </SelectField>

      <SubmitButton pending={pending}>Adicionar ativo</SubmitButton>
    </form>
  );
}
