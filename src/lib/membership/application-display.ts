import type { FormFieldConfig } from "@/lib/membership/form-config-defaults";

const STEP_TITLES: Record<string, string> = {
  Personal: "Section A: Personal information",
  Professional: "Section B: Professional information",
  Academic: "Section B: Academic information",
  Other: "Section C: Other details",
};

export function stepSectionTitle(step: string): string {
  return STEP_TITLES[step] ?? step;
}

export function formatApplicationFieldValue(
  key: string,
  value: unknown,
): string {
  if (value === null || value === undefined || value === "") return "—";

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (key === "sector" && typeof value === "string") {
    if (value === "private") return "Private sector";
    if (value === "public") return "Public sector";
  }

  if (
    (key === "date_of_birth" || key === "date_of_admission") &&
    typeof value === "string"
  ) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  return String(value);
}

export type ApplicationFormSection = {
  step: string;
  title: string;
  fields: { key: string; label: string; value: string }[];
};

/** Build form sections from application row + merged form field config. */
export function buildApplicationFormSections(
  app: Record<string, unknown>,
  fieldsConfig: FormFieldConfig[],
  stepsConfig: string[],
): ApplicationFormSection[] {
  const formSteps = stepsConfig.filter((s) => s !== "Documents" && s !== "Declaration");
  const byStep = new Map<string, FormFieldConfig[]>();

  for (const field of fieldsConfig) {
    if (!field.enabled || field.key === "declaration") continue;
    if (!formSteps.includes(field.step)) continue;
    const list = byStep.get(field.step) ?? [];
    list.push(field);
    byStep.set(field.step, list);
  }

  return formSteps
    .filter((step) => byStep.has(step))
    .map((step) => ({
      step,
      title: stepSectionTitle(step),
      fields: (byStep.get(step) ?? []).map((field) => ({
        key: field.key,
        label: field.label,
        value: formatApplicationFieldValue(field.key, app[field.key]),
      })),
    }));
}

export function applicationMetadataRows(app: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = [];

  rows.push({ label: "Application status", value: String(app.status ?? "—") });
  rows.push({ label: "Payment status", value: String(app.payment_status ?? "—") });
  if (app.declaration_accepted_at) {
    rows.push({
      label: "Declaration accepted",
      value: new Date(String(app.declaration_accepted_at)).toLocaleString("en-UG"),
    });
  }
  if (app.created_at) {
    rows.push({
      label: "Submitted",
      value: new Date(String(app.created_at)).toLocaleString("en-UG"),
    });
  }
  if (app.reviewed_at) {
    rows.push({
      label: "Reviewed",
      value: new Date(String(app.reviewed_at)).toLocaleString("en-UG"),
    });
  }
  if (app.admin_notes) {
    rows.push({ label: "Admin notes", value: String(app.admin_notes) });
  }

  return rows;
}
