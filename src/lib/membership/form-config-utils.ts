import type { FormFieldConfig, MembershipFormConfig } from "@/lib/membership/form-config-defaults";
import {
  DEFAULT_PROFESSIONAL_CONFIG,
  DEFAULT_STUDENT_CONFIG,
  PROFESSIONAL_FIELD_DEFAULTS,
  STUDENT_FIELD_DEFAULTS,
} from "@/lib/membership/form-config-defaults";

/** Merge stored config with canonical defaults so admin + public always show every field. */
export function mergeFieldsConfig(
  defaults: FormFieldConfig[],
  stored: FormFieldConfig[] | null | undefined,
): FormFieldConfig[] {
  const byKey = new Map((stored ?? []).map((f) => [f.key, f]));
  const merged = defaults.map((def) => ({ ...def, ...byKey.get(def.key) }));
  for (const f of stored ?? []) {
    if (!defaults.some((d) => d.key === f.key)) merged.push(f);
  }
  return merged;
}

export function mergeFormConfig(
  base: MembershipFormConfig,
  partial: Partial<MembershipFormConfig> | null | undefined,
): MembershipFormConfig {
  const defaults =
    base.membership_type === "professional"
      ? PROFESSIONAL_FIELD_DEFAULTS
      : STUDENT_FIELD_DEFAULTS;
  const defaultConfig =
    base.membership_type === "professional"
      ? DEFAULT_PROFESSIONAL_CONFIG
      : DEFAULT_STUDENT_CONFIG;

  if (!partial) return { ...defaultConfig };

  return {
    ...defaultConfig,
    ...partial,
    fields_config: mergeFieldsConfig(
      defaults,
      (partial.fields_config as FormFieldConfig[]) ?? [],
    ),
    documents_config:
      partial.documents_config?.length
        ? partial.documents_config
        : defaultConfig.documents_config,
    steps_config:
      partial.steps_config?.length ? partial.steps_config : defaultConfig.steps_config,
  };
}

export function fieldConfig(
  fields: FormFieldConfig[],
  key: string,
): FormFieldConfig | undefined {
  return fields.find((f) => f.key === key);
}

export function fieldLabel(
  fields: FormFieldConfig[],
  key: string,
  fallback: string,
): string {
  return fieldConfig(fields, key)?.label ?? fallback;
}

export function isFieldEnabled(fields: FormFieldConfig[], key: string): boolean {
  const f = fieldConfig(fields, key);
  return f?.enabled !== false;
}

export function fieldsForStep(
  fields: FormFieldConfig[],
  stepName: string,
): (keyof Record<string, unknown>)[] {
  return fields
    .filter((f) => f.enabled && f.step === stepName)
    .map((f) => f.key as keyof Record<string, unknown>);
}
