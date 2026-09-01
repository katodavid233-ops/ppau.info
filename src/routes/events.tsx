import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/events")({
  head: () =>
    pageHead({
      title: "PPAU Events",
      description:
        "Upcoming PPAU events including Pharmacy Week, public health campaigns, conferences, and CPD sessions across Uganda.",
      path: "/events",
      keywords: "PPAU events, Pharmacy Week Uganda, pharmacy conference Uganda, CPD events",
    }),
  component: Events,
});

const EVENTS = [
  {
    t: "Pharmacy Week 2026",
    date: "Sep 22 to 28",
    time: "All week",
    loc: "Kampala Serena Hotel",
    tag: "Flagship",
    desc: "Uganda's largest gathering of pharmacy professionals, featuring exhibitions, talks, and networking.",
  },
  {
    t: "Sickle Cell Awareness Day",
    date: "Jun 19, 2026",
    time: "9:00 AM",
    loc: "Mulago National Hospital",
    tag: "Public Health",
    desc: "Community education and free screening for sickle cell disease across Kampala.",
  },
  {
    t: "CPD: Antimicrobial Stewardship",
    date: "Jul 12, 2026",
    time: "2:00 PM",
    loc: "Online (Zoom)",
    tag: "CPD",
    desc: "Live, accredited continuing education session on responsible antibiotic use.",
  },
  {
    t: "World Pharmacist Day",
    date: "Sep 25, 2026",
    time: "10:00 AM",
    loc: "National Theatre",
    tag: "Celebration",
    desc: "Honoring Uganda's pharmacy professionals with awards, speeches, and community outreach.",
  },
];

const tagColors: Record<string, string> = {
  Flagship: "bg-primary text-white",
  "Public Health": "bg-emerald-100 text-emerald-700",
  CPD: "bg-blue-100 text-blue-700",
  Celebration: "bg-amber-100 text-amber-700",
};

function Events() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Upcoming Events"
        subtitle="Join us at flagship events, awareness campaigns, and CPD sessions across Uganda."
      />

      <section aria-labelledby="events-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Calendar</span>
            <h2 id="events-heading" className="text-3xl font-bold text-foreground">
              What's Coming Up
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {EVENTS.map((e) => (
              <article
                key={e.t}
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-soft card-hover"
              >
                <div className="bg-gradient-primary px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-white">{e.date}</div>
                    <div className="flex items-center gap-1.5 text-white/70 text-sm mt-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {e.time}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${tagColors[e.tag] ?? "bg-white/20 text-white"}`}
                  >
                    {e.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-foreground text-lg mb-2">{e.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{e.desc}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" aria-hidden="true" /> {e.loc}
                  </div>
                  <Button
                    asChild
                    className="bg-primary hover:bg-secondary text-white rounded-full px-6 h-10 text-sm font-semibold"
                  >
                    <Link to="/contact">Register Now</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Want to Host or Sponsor an Event?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
            Partner with PPAU to reach Uganda's pharmacy professionals through impactful events.
          </p>
          <Button
            asChild
            className="bg-primary hover:bg-secondary text-white rounded-full px-8 h-11 font-semibold"
          >
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
