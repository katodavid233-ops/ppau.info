import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/committee")({
  head: () =>
    pageHead({
      title: "PPAU Committees",
      description:
        "Standing committees of the Pharmacy Professionals Association of Uganda — AMR and pharmacovigilance, CPD, legal affairs, standards, and research.",
      path: "/committee",
    }),
  component: CommitteePage,
});

const COMMITTEES: { title: string; chair: string; members: string[] }[] = [
  {
    title: "AMR and Pharmacovigilance Committee",
    chair: "Mr. Akena Raymond — Chairperson",
    members: ["Mr. Kabuuka Kamada", "Mr. Abolla Emmanuel", "Mr. Ssenfuma Henry", "Mr. Aguma Simon"],
  },
  {
    title: "CPD Committee",
    chair: "Mr. Muyinda Nathan — Chairperson",
    members: ["Ms. Nammuli Mercy", "Mr. Ocen Moses", "Mr. Bawutu Xaviero"],
  },
  {
    title: "Legal, Policy and Regulatory Affairs Committee",
    chair: "Counsel Mugisha Echo — Chairperson",
    members: ["Mr. Tumwesigye Ambrose", "Mr. Yusuf Atwiine"],
  },
  {
    title: "Standards Committee",
    chair: "Mr. Kayongo Daniel — Chairperson",
    members: ["Mr. Derrick Obin", "Mr. Serugo Richard", "Mr. Kivumbi Douglas"],
  },
  {
    title: "Research, Innovation and Publications Committee",
    chair: "Mr. Akankwatsa Ignatius — Chairperson",
    members: ["Mr. Wojjo William", "Mr. Ocom James"],
  },
];

function CommitteePage() {
  return (
    <>
      <PageHero
        eyebrow="Governance"
        title="Committees"
        subtitle="Pharmacy Professionals Association of Uganda — committee structure and membership."
      />

      <section className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {COMMITTEES.map((c) => (
              <Card key={c.title} className="border-border shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg leading-snug text-primary">{c.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Chairperson
                    </p>
                    <p className="text-sm font-semibold text-foreground">{c.chair}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Members
                    </p>
                    <ul className="space-y-1.5 text-sm text-foreground/90">
                      {c.members.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
