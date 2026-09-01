import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ShieldCheck, Award, Megaphone, Handshake, Sparkles, CheckCircle2 } from "lucide-react";
import presidentImg from "@/assets/president.jpeg";
import vicePresidentImg from "@/assets/vice-president.jpeg";
import secretaryImg from "@/assets/secretary.jpeg";
import treasurerImg from "@/assets/treasurer.jpeg";
import deputySecretaryImg from "@/assets/deputy-secretary.jpeg";
import centralRegionImg from "@/assets/central-region.jpeg";
import easternRegionImg from "@/assets/eastern-region.jpeg";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About PPAU | Mission, Vision and Leadership",
      description:
        "Learn about the Pharmacy Professionals Association of Uganda — our history, mission, vision, core values, and national leadership team.",
      path: "/about",
      keywords:
        "about PPAU, pharmacy association Uganda, PPAU leadership, PPAU mission, AHPC pharmacy",
    }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Building Uganda's Pharmacy Profession"
        subtitle="PPAU brings together pharmacy professionals under one voice, recognized under the Allied Health Professionals Council framework."
      />

      {/* Who We Are */}
      <section aria-labelledby="who-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div>
              <span className="section-label">Who We Are</span>
              <h2 id="who-heading" className="text-3xl font-bold text-foreground mb-5">
                The National Body for Pharmacy Professionals
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Pharmacy Professionals Association of Uganda (PPAU) is the national body
                representing Dispensers, pharmacy assistants, and allied pharmacy professionals. We
                exist to elevate professional standards, champion ethical practice, and strengthen
                pharmaceutical healthcare delivery.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Through advocacy, continuous professional development, and community building, we
                ensure our members are equipped, recognized, and empowered to serve every Ugandan.
              </p>
              <ul className="space-y-3" aria-label="Key highlights">
                {[
                  "Recognized under the Allied Health Professionals' Council",
                  "Advocating for fair licensing and professional standards",
                  "Delivering accredited CPD/CME programs nationwide",
                  "Building a vibrant community of pharmacy professionals",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-5 w-5 text-primary shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-soft">
                <div className="icon-box mb-4">
                  <Megaphone className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Mission</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advance pharmacy practice in Uganda through advocacy, education, and ethical
                  professional standards.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-6 shadow-soft">
                <div className="icon-box mb-4">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Vision</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A Uganda where every pharmacy professional is empowered, recognized, and central
                  to public health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section aria-labelledby="journey-heading" className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">History</span>
            <h2 id="journey-heading" className="text-3xl font-bold text-foreground">
              Our Journey
            </h2>
          </div>
          <ol className="relative">
            <div
              className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px"
              aria-hidden="true"
            />
            {[
              {
                year: "Founding",
                title: "PPAU established",
                desc: "Pharmacy professionals unite under a shared professional voice.",
              },
              {
                year: "Growth",
                title: "Recognition under AHPC",
                desc: "Officially recognized within the Allied Health Professionals Council framework.",
              },
              {
                year: "Today",
                title: "Nationwide Membership",
                desc: "Serving over 2,000 pharmacy professionals across Uganda.",
              },
              {
                year: "Tomorrow",
                title: "Digital CPD Platform",
                desc: "Modern continuous learning experiences for every member.",
              },
            ].map((m, i) => (
              <li
                key={m.title}
                className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8 mb-10 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="md:text-right md:pr-10">
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                    {m.year}
                  </div>
                  <h3 className="font-bold text-foreground">{m.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                </div>
                <div
                  className="absolute left-4 md:left-1/2 top-1 h-3 w-3 rounded-full bg-primary md:-translate-x-1.5 border-2 border-white shadow"
                  aria-hidden="true"
                />
                <div />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Core Values */}
      <section aria-labelledby="values-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">What We Believe</span>
            <h2 id="values-heading" className="text-3xl font-bold text-foreground">
              Our Core Values
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: ShieldCheck, t: "Integrity" },
              { icon: Award, t: "Professionalism" },
              { icon: Megaphone, t: "Advocacy" },
              { icon: Handshake, t: "Collaboration" },
              { icon: Sparkles, t: "Excellence" },
            ].map((v) => (
              <div
                key={v.t}
                className="bg-white rounded-2xl border border-border p-6 text-center shadow-soft card-hover"
              >
                <div className="icon-box mx-auto mb-4">
                  <v.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{v.t}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section aria-labelledby="leadership-heading" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Our Team</span>
            <h2 id="leadership-heading" className="text-3xl font-bold text-foreground">
              Leadership Team
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "Mr. Danson Sembatya", r: "President", img: presidentImg },
              { n: "KHAUKHA M.A EMMANUEL", r: "Vice President", img: vicePresidentImg },
              { n: "GWEBAYANGA COLLINE", r: "Secretary", img: secretaryImg },
              { n: "Boonabaana Bernard", r: "National Treasurer", img: treasurerImg },
              { n: "MUKIMBIRE JULIUS", r: "Deputy Secretary", img: deputySecretaryImg },
              { n: "Ssekayombya Michael", r: "Chairperson Central Region", img: centralRegionImg },
              { n: "ATUHAIRE EDSON", r: "Chairperson Eastern Region", img: easternRegionImg },
            ].map((p) => (
              <div
                key={p.n}
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-soft card-hover text-center"
              >
                <div className="h-52 overflow-hidden bg-primary-soft">
                  <img
                    src={p.img}
                    alt={`${p.n}, ${p.r}`}
                    loading="lazy"
                    className="h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground text-sm mb-1">{p.n}</h3>
                  <p className="text-xs text-primary font-semibold">{p.r}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
