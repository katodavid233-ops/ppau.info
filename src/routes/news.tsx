import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Calendar, FileText, Download, Clock } from "lucide-react";
import committeePdf from "@/assets/PPAU_COMMITTEES_2026-27.pdf";
import amrPdf from "@/assets/AMR_Newsletter.pdf";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news")({
  head: () =>
    pageHead({
      title: "News and Updates",
      description:
        "Latest PPAU news on pharmacy advocacy, regulation, public health, and professional practice in Uganda.",
      path: "/news",
      keywords:
        "PPAU news, pharmacy news Uganda, NDHPA Act, UHPAB transcripts, dispensers private practice",
    }),
  component: News,
});

type Post = {
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  isDoc?: boolean;
  file?: string;
  readTime: string;
};

const POSTS: Post[] = [
  {
    tag: "Policy",
    title:
      "PPAU Sounds Alarm Over Suspected Plot to Alter Drug Law, Warns Thousands of Dispensers Could Lose Private Practice Rights",
    excerpt:
      "PPAU has written to the Attorney General expressing concern over reported plans to amend the NDHPA Act, 2026, warning that changes could threaten the legal rights of Diploma in Pharmacy holders to engage in private practice.",
    date: "July 13, 2026",
    readTime: "5 min read",
  },
  {
    tag: "Advocacy",
    title:
      "PPAU Urges Pharmaceutical Companies to Hire Only Qualified Pharmacy Professionals for Marketing Jobs",
    excerpt:
      "PPAU has issued a strong advice to pharmaceutical companies to engage only registered pharmacy professionals for positions involving the scientific promotion and representation of medicines.",
    date: "July 13, 2026",
    readTime: "5 min read",
  },
  {
    tag: "Public Health",
    title:
      "Allied Health Drug Dispensaries: A Turning Point in the Fight Against Antimicrobial Resistance (AMR) in Uganda",
    excerpt:
      "Antimicrobial Resistance (AMR) is one of the greatest public health threats facing the world today. Allied Health Drug Dispensaries are becoming a critical turning point in this fight through professional medicine handling and stewardship.",
    date: "May 9, 2026",
    isDoc: true,
    file: amrPdf,
    readTime: "10 min read",
  },
  {
    tag: "Policy",
    title: "PPAU response on the Protection of Sovereignty bill, 2026",
    excerpt:
      "The association submits its formal position regarding the impact of the new bill on pharmaceutical practice and governance.",
    date: "May 8, 2026",
    isDoc: true,
    readTime: "5 min read",
  },
  {
    tag: "Licensing",
    title: "AHPC responds to PPAU on licensing of Dispensers drug shops",
    excerpt:
      "Allied Health Professionals Council provides feedback on the licensing framework for dispensers operating drug shops.",
    date: "May 5, 2026",
    isDoc: true,
    readTime: "4 min read",
  },
  {
    tag: "Internal",
    title: "PPAU appoints committee members 2026 to 2027",
    excerpt:
      "Official announcement of the newly appointed committee members for the upcoming term.",
    date: "May 2, 2026",
    isDoc: true,
    file: committeePdf,
    readTime: "2 min read",
  },
  {
    tag: "Advocacy",
    title: "PPAU asks for clarity from AHPC on licensing of Dispensers private practice",
    excerpt:
      "Requesting clear guidelines on the requirements and boundaries for dispensers engaged in private practice.",
    date: "April 28, 2026",
    isDoc: true,
    readTime: "6 min read",
  },
  {
    tag: "Advocacy",
    title: "PPAU advances scope-of-practice review with Allied Health Professionals Council",
    excerpt: "Latest engagement secures stronger recognition for Dispensers.",
    date: "Apr 28, 2026",
    readTime: "3 min read",
  },
  {
    tag: "Public Health",
    title: "World Pharmacist Day: Dispensers at the heart of medication safety",
    excerpt: "Highlights from this year's national celebrations.",
    date: "Apr 12, 2026",
    readTime: "8 min read",
  },
  {
    tag: "Education",
    title: "New CPD curriculum launched for community pharmacy assistants",
    excerpt: "Eight new accredited modules now available online.",
    date: "Mar 30, 2026",
    readTime: "2 min read",
  },
];

const tagColors: Record<string, string> = {
  "Public Health": "bg-emerald-100 text-emerald-700",
  Policy: "bg-blue-100 text-blue-700",
  Licensing: "bg-amber-100 text-amber-700",
  Internal: "bg-slate-100 text-slate-600",
  Advocacy: "bg-primary-soft text-primary",
  Education: "bg-purple-100 text-purple-700",
};

function News() {
  const { pathname } = useLocation();
  const isChildRoute = pathname !== "/news";

  if (isChildRoute) {
    return <Outlet />;
  }

  return (
    <>
      <PageHero
        eyebrow="News"
        title="From the Association"
        subtitle="Official communications, advocacy wins, and professional updates."
      />

      <section aria-labelledby="news-list-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Latest</span>
            <h2 id="news-list-heading" className="text-3xl font-bold text-foreground">
              News and Articles
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((p) => (
              <article
                key={p.title}
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-soft card-hover flex flex-col"
              >
                <div className="h-1.5 bg-gradient-primary" aria-hidden="true" />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${tagColors[p.tag] ?? "bg-primary-soft text-primary"}`}
                    >
                      {p.tag}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" /> {p.readTime}
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground text-sm leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3 flex-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                    {p.excerpt}
                  </p>

                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <time dateTime={p.date}>{p.date}</time>
                    </div>
                    {p.isDoc && (
                      <div>
                        {p.file ? (
                          <a
                            href={p.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Download: ${p.title}`}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-secondary transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
                          </a>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Document
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
