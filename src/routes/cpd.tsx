import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, Users, GraduationCap, CheckCircle2 } from "lucide-react";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cpd")({
  head: () =>
    pageHead({
      title: "CPD and CME Courses",
      description:
        "Browse PPAU continuous professional development and CME courses for dispensers, pharmacy assistants, and allied pharmacy professionals in Uganda.",
      path: "/cpd",
      keywords:
        "CPD Uganda pharmacy, CME pharmacy, antimicrobial stewardship, pharmacy law, PPAU courses",
    }),
  component: Cpd,
});

export function Cpd() {
  return (
    <>
      <PageHero
        eyebrow="CPD / CME"
        title="Continuous Professional Development"
        subtitle="Courses designed for pharmacy professionals — practical, accredited, and impactful."
      />

      <section aria-labelledby="cpd-intro-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="section-label">Coming Soon</span>
              <h2 id="cpd-intro-heading" className="text-4xl font-bold text-foreground mb-5">
                Our CPD Platform is Being Built
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our specialized Continuous Professional Development courses are currently being
                finalized and will be available shortly. The platform will offer accredited,
                practical learning experiences for every pharmacy professional in Uganda.
              </p>
              <ul className="space-y-3 mb-8" aria-label="Upcoming platform features">
                {[
                  "Accredited CPD/CME modules",
                  "Online and in-person learning options",
                  "Certificates of completion",
                  "Tracks for Dispensers and pharmacy assistants",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-primary hover:bg-secondary text-white rounded-full px-7 h-11 font-semibold"
                >
                  <Link to="/contact">Get Notified</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-7 h-11 font-semibold"
                >
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2" aria-label="Upcoming course previews">
              {[
                {
                  icon: BookOpen,
                  title: "Antimicrobial Stewardship",
                  tag: "Upcoming",
                  duration: "4 hours",
                },
                {
                  icon: GraduationCap,
                  title: "Pharmacy Law and Ethics",
                  tag: "Upcoming",
                  duration: "3 hours",
                },
                { icon: Users, title: "Patient Counselling", tag: "Upcoming", duration: "5 hours" },
                {
                  icon: Award,
                  title: "Drug Dispensing Practices",
                  tag: "Upcoming",
                  duration: "6 hours",
                },
              ].map((course) => (
                <div
                  key={course.title}
                  className="bg-white rounded-2xl border border-border p-5 shadow-soft opacity-70"
                >
                  <div className="icon-box mb-3 w-10 h-10 rounded-xl">
                    <course.icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{course.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                      {course.tag}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" /> {course.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="cpd-benefits-heading"
        className="bg-white py-16 border-t border-border"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-label">Why It Matters</span>
            <h2 id="cpd-benefits-heading" className="text-3xl font-bold text-foreground">
              Benefits of CPD
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Award,
                t: "Stay Accredited",
                d: "Meet regulatory requirements and maintain your professional standing.",
              },
              {
                icon: BookOpen,
                t: "Expand Knowledge",
                d: "Keep up with the latest developments in pharmacy practice and policy.",
              },
              {
                icon: Users,
                t: "Advance Your Career",
                d: "Open doors to new roles, responsibilities, and recognition.",
              },
            ].map((b) => (
              <div
                key={b.t}
                className="bg-background rounded-2xl border border-border p-6 shadow-soft text-center card-hover"
              >
                <div className="icon-box mx-auto mb-4">
                  <b.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{b.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
