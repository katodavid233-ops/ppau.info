import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

const PDF_PATH = "/documents/ppau-strategic-plan.pdf";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/strategic-plan")({
  head: () =>
    pageHead({
      title: "PPAU Strategic Plan",
      description:
        "View and download the official Pharmacy Professionals Association of Uganda strategic plan.",
      path: "/strategic-plan",
    }),
  component: StrategicPlanPage,
});

function StrategicPlanPage() {
  return (
    <>
      <PageHero
        eyebrow="Planning"
        title="PPAU Strategic Plan"
        subtitle="Official strategic plan document — view in your browser or download the PDF."
      />

      <section className="section-padding bg-background pb-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-primary hover:bg-secondary text-white rounded-full font-semibold"
            >
              <a href={PDF_PATH} download="PPAU-Strategic-Plan.pdf">
                <Download className="h-4 w-4 mr-2" aria-hidden />
                Download PDF
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full font-semibold border-primary text-primary"
            >
              <a href={PDF_PATH} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" aria-hidden />
                Open in new tab
              </a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden min-h-[75vh]">
            <iframe
              title="PPAU Strategic Plan PDF"
              src={`${PDF_PATH}#view=FitH`}
              className="w-full min-h-[75vh] border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
