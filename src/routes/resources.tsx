import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import {
  Download,
  BookOpen,
  Shield,
  Users,
  Scale,
  ListChecks,
  Building2,
  FileText,
} from "lucide-react";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/resources")({
  head: () =>
    pageHead({
      title: "PPAU Resources and Downloads",
      description:
        "Download PPAU documents including the constitution, strategic plan, diploma in pharmacy curriculum, professional guidelines, and official member lists.",
      path: "/resources",
      keywords:
        "PPAU resources, pharmacy curriculum Uganda, PPAU constitution, diploma in pharmacy, pharmacy guidelines",
    }),
  component: Resources,
});

type Doc = {
  t: string;
  d: string;
  icon: typeof BookOpen;
  href?: string;
};

const DOCS: Doc[] = [
  {
    t: "Curriculum for Diploma in Pharmacy",
    d: "Official curriculum for the Diploma in Pharmacy programme.",
    icon: BookOpen,
    href: "/documents/curriculum-for-diploma-in-pharmacy.pdf",
  },
  { t: "PPAU Constitution", d: "The governing constitution of the association.", icon: Scale },
  { t: "Code of Conduct", d: "Ethical and professional standards for members.", icon: Shield },
  {
    t: "Professional Guidelines",
    d: "Practice guidelines for pharmacy professionals.",
    icon: BookOpen,
  },
  {
    t: "Membership Eligibility",
    d: "Criteria and process for becoming a PPAU member.",
    icon: Users,
  },
];

const PAGES = [
  {
    to: "/registered-subscribed-members",
    title: "Registered Subscribed Members",
    d: "Official list of registered subscribed members.",
    icon: ListChecks,
  },
  {
    to: "/training-institutions",
    title: "Allied Health Pharmacy Training Institutions",
    d: "Training institutions in Uganda and pharmacy student associations.",
    icon: Building2,
  },
  {
    to: "/strategic-plan",
    title: "PPAU Strategic Plan",
    d: "View or download the association strategic plan (PDF).",
    icon: FileText,
  },
] as const;

function Resources() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Documents and Guidelines"
        subtitle="Official PPAU documents, policies, downloadable resources, and published member lists."
      />

      <section
        aria-labelledby="lists-heading"
        className="section-padding bg-white border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-label">On this site</span>
            <h2 id="lists-heading" className="text-3xl font-bold text-foreground">
              Lists and strategic plan
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PAGES.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="group bg-background rounded-2xl border border-border p-6 shadow-soft card-hover flex flex-col"
              >
                <div className="icon-box mb-4 group-hover:scale-105 transition-transform">
                  <p.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{p.d}</p>
                <span className="text-primary text-xs font-semibold">Open page →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="docs-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Downloads</span>
            <h2 id="docs-heading" className="text-3xl font-bold text-foreground">
              Official Documents
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DOCS.map((d) => (
              <div
                key={d.t}
                className="group bg-white rounded-2xl border border-border p-6 shadow-soft card-hover"
              >
                <div className="icon-box mb-5 group-hover:scale-105 transition-transform">
                  <d.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{d.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{d.d}</p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-white rounded-full text-xs font-semibold"
                  aria-label={`Download ${d.t} as PDF`}
                >
                  <a
                    href={d.href}
                    download
                    onClick={d.href ? undefined : (e) => e.preventDefault()}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" /> Download PDF
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
            Contact our team and we will help you find the right document or resource.
          </p>
          <Button
            asChild
            className="bg-primary hover:bg-secondary text-white rounded-full px-8 h-11 font-semibold"
          >
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
