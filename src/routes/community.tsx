import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Network, Heart, Globe, BookOpen } from "lucide-react";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/community")({
  head: () =>
    pageHead({
      title: "PPAU Community",
      description:
        "Join the PPAU professional community — networking, regional groups, and peer support for pharmacy professionals across Uganda.",
      path: "/community",
    }),
  component: Community,
});

function Community() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title="A Network That Grows With You"
        subtitle="Groups, discussions, and mentorship, by members, for members."
      />

      <section
        aria-labelledby="community-features-heading"
        className="section-padding bg-background"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">What We Offer</span>
            <h2 id="community-features-heading" className="text-3xl font-bold text-foreground">
              Community Features
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                t: "Specialty Groups",
                d: "Join groups across clinical, retail, hospital, and academic pharmacy practice.",
              },
              {
                icon: MessageSquare,
                t: "Peer Discussions",
                d: "Ask questions, share knowledge, and learn from experienced peers in real time.",
              },
              {
                icon: Network,
                t: "Mentorship",
                d: "Senior members guiding the next generation of pharmacy professionals.",
              },
              {
                icon: BookOpen,
                t: "Learning Resources",
                d: "Access shared study materials, guidelines, and professional reading lists.",
              },
              {
                icon: Globe,
                t: "Regional Chapters",
                d: "Connect with pharmacy professionals in your region across Uganda.",
              },
              {
                icon: Heart,
                t: "Wellness Support",
                d: "A supportive community that cares about your professional and personal wellbeing.",
              },
            ].map((b) => (
              <div
                key={b.t}
                className="group bg-white rounded-2xl border border-border p-6 shadow-soft card-hover"
              >
                <div className="icon-box mb-4 group-hover:scale-105 transition-transform">
                  <b.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{b.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="bg-gradient-primary rounded-2xl p-12 text-center text-white shadow-elegant">
            <h2 className="text-3xl font-bold mb-3">Ready to Join the Community?</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Become a PPAU member today and connect with thousands of pharmacy professionals across
              Uganda.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-10 h-12"
            >
              <Link to="/membership">Join the Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
