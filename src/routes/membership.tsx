import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Check, Users, BookOpen, Megaphone, HeartHandshake, Star } from "lucide-react";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/membership")({
  head: () =>
    pageHead({
      title: "Join PPAU Membership",
      description:
        "Become a PPAU professional or student member. Access advocacy, CPD/CME, networking, and recognition for Uganda's pharmacy workforce.",
      path: "/membership",
      keywords:
        "join PPAU, PPAU membership, professional membership Uganda, student pharmacy membership, dispenser association",
    }),
  component: Membership,
});

function Membership() {
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Become a PPAU Member"
        subtitle="Join Uganda's leading professional community for Dispensers, pharmacy assistants, and allied pharmacy professionals."
      />

      <section
        aria-labelledby="membership-options-heading"
        className="section-padding bg-background"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Choose Your Plan</span>
            <h2 id="membership-options-heading" className="text-3xl font-bold text-foreground">
              Membership Options
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Professional */}
            <div className="bg-gradient-primary rounded-2xl p-8 text-white shadow-elegant relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div className="icon-box bg-white/20 mb-5">
                <Star className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold mb-1">Professional Membership</h3>
              <div className="text-white/90 text-lg font-bold mb-1">UGX 50,000 / year</div>
              <div className="text-white/70 text-sm mb-6">Annual subscription</div>
              <ul className="space-y-3 mb-8" aria-label="Professional membership features">
                {[
                  "Full advocacy and representation",
                  "Discounted CPD/CME courses",
                  "Member-only events",
                  "Recognition and certification",
                  "Committee participation",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-white shrink-0" aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full bg-white text-primary hover:bg-white/90 font-semibold rounded-full h-11"
              >
                <Link to="/membership-form">Apply Now</Link>
              </Button>
            </div>

            {/* Student */}
            <div className="bg-white rounded-2xl border border-border p-8 shadow-soft">
              <div className="icon-box mb-5">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Student Membership</h3>
              <div className="text-primary font-bold text-xl mb-6">Free</div>
              <ul className="space-y-3 mb-8" aria-label="Student membership features">
                {[
                  "Educational opportunities",
                  "Mentorship access",
                  "Career resources",
                  "Student events",
                  "Pathway to professional membership",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground/80">
                    <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-full h-11"
              >
                <Link to="/membership-form">Register Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="benefits-heading" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Why Join</span>
            <h2 id="benefits-heading" className="text-3xl font-bold text-foreground">
              Member Benefits
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                i: Users,
                t: "Networking",
                d: "Connect with peers across Uganda and build lasting professional relationships.",
              },
              {
                i: Megaphone,
                t: "Advocacy",
                d: "A national voice for your profession in policy and regulatory discussions.",
              },
              {
                i: BookOpen,
                t: "CPD Access",
                d: "Continuous learning made accessible with accredited courses and workshops.",
              },
              {
                i: HeartHandshake,
                t: "Recognition",
                d: "Be celebrated for your impact and contributions to pharmacy in Uganda.",
              },
            ].map((b) => (
              <div
                key={b.t}
                className="bg-background rounded-2xl border border-border p-6 shadow-soft card-hover text-center"
              >
                <div className="icon-box mx-auto mb-4">
                  <b.i className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{b.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="bg-gradient-primary rounded-2xl p-12 text-center text-white shadow-elegant">
            <h2 className="text-3xl font-bold mb-3">Ready to Take the Next Step?</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Volunteer, sponsor, or join a committee to shape pharmacy in Uganda.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-10 h-12"
            >
              <Link to="/contact">Get Involved</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
