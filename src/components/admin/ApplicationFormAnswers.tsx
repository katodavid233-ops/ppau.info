import type { ApplicationFormSection } from "@/lib/membership/application-display";

type Props = {
  sections: ApplicationFormSection[];
  metadata?: { label: string; value: string }[];
};

export function ApplicationFormAnswers({ sections, metadata }: Props) {
  const hasAnswers = sections.some((s) =>
    s.fields.some((f) => f.value !== "—"),
  );

  return (
    <div className="space-y-6 mb-6">
      <div>
        <h2 className="text-lg font-bold">Application form responses</h2>
        <p className="text-sm text-muted-foreground">
          Answers as submitted on the membership form
        </p>
      </div>

      {!hasAnswers && (
        <p className="text-sm text-muted-foreground rounded-xl border bg-white p-6">
          No form answers saved yet — the applicant may still be on a draft step.
        </p>
      )}

      {sections.map((section) => (
        <div key={section.step} className="rounded-xl border bg-white p-6 shadow-soft">
          <h3 className="font-bold text-base mb-4">{section.title}</h3>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            {section.fields.map((field) => (
              <div key={field.key} className="min-w-0">
                <dt className="text-muted-foreground font-medium">{field.label}</dt>
                <dd className="mt-0.5 break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      {metadata && metadata.length > 0 && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-6">
          <h3 className="font-bold text-sm mb-3 text-muted-foreground">Processing details</h3>
          <dl className="grid gap-2 sm:grid-cols-2 text-sm">
            {metadata.map((row) => (
              <div key={row.label}>
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="mt-0.5 break-words">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
