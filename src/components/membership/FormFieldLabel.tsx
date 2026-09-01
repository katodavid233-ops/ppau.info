import { FormLabel } from "@/components/ui/form";
import type { FormFieldConfig } from "@/lib/membership/form-config-defaults";
import { fieldLabel } from "@/lib/membership/form-config-utils";

type Props = {
  fields: FormFieldConfig[];
  name: string;
  fallback: string;
  className?: string;
};

export function FormFieldLabel({ fields, name, fallback, className }: Props) {
  const cfg = fields.find((f) => f.key === name);
  return (
    <div className={className}>
      <FormLabel>{fieldLabel(fields, name, fallback)}</FormLabel>
      {cfg?.helpText ? (
        <p className="text-xs text-muted-foreground mt-0.5">{cfg.helpText}</p>
      ) : null}
    </div>
  );
}
