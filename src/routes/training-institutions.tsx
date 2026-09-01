import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { parseCsv } from "@/lib/csv";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/training-institutions")({
  head: () =>
    pageHead({
      title: "Allied Health Pharmacy Training Institutions",
      description:
        "Directory of allied health pharmacy training institutions in Uganda and whether they host a pharmacy students association.",
      path: "/training-institutions",
      keywords:
        "pharmacy schools Uganda, diploma in pharmacy institutions, allied health training Uganda, pharmacy students association",
    }),
  component: TrainingInstitutions,
});

function TrainingInstitutions() {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/allied-health-pharmacy-training-institutions.csv");
        if (!res.ok) throw new Error("Could not load institutions list.");
        const text = await res.text();
        if (cancelled) return;
        setRows(parseCsv(text.trim()));
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Load failed.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const header = rows?.[0];
  const body = rows?.slice(1) ?? [];

  return (
    <>
      <PageHero
        eyebrow="Education"
        title="Allied Health Pharmacy Training Institutions in Uganda"
        subtitle="Institutions offering allied health pharmacy training and whether they host a pharmacy students association."
      />

      <section className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {err && (
            <p className="text-sm text-destructive font-medium" role="alert">
              {err}
            </p>
          )}
          {!err && rows === null && (
            <p className="text-sm text-muted-foreground">Loading institutions…</p>
          )}
          {rows && header && (
            <div className="w-full overflow-x-auto rounded-2xl border border-border bg-white shadow-soft">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {header.map((h, i) => (
                      <TableHead key={i} className="whitespace-nowrap font-semibold min-w-[8rem]">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {body.map((r, ri) => (
                    <TableRow key={ri}>
                      {header.map((_, ci) => (
                        <TableCell key={ci} className="text-sm max-w-md">
                          {r[ci]?.trim() || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
