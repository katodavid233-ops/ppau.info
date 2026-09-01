import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  Megaphone,
  Stethoscope,
  Users,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Star,
  BookOpen,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg1 from "@/assets/hero-pharmacy.jpg";
import heroImg2 from "@/assets/hero-pharmacy-2.jpg";
import heroImg3 from "@/assets/hero-pharmacy-3.jpg";
import slider1 from "@/assets/slider 1.jpg.jpeg";
import heroPpauLeadership from "@/assets/hero-ppau-leadership.png";
import heroPpauCommunity from "@/assets/hero-ppau-community.png";
import whoWeAreImg from "@/assets/who-we-are.jpg.jpeg";
import presidentImg from "@/assets/president.jpeg";
import vicePresidentImg from "@/assets/vice-president.jpeg";
import secretaryImg from "@/assets/secretary.jpeg";
import treasurerImg from "@/assets/treasurer.jpeg";
import ndaMeetingImg from "@/assets/nda-ahpc-ppau-meeting.jpg.jpeg";
import familyPlanningImg from "@/assets/Pharmacists and Dispensers to Offer Family Planning Services in Pharmacies and Drug Dispensaries.jpg.jpg";
import ppauAlarmsImg from "@/assets/ppau-alarms-transcripts.jpg.jpg";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "PPAU | Advancing Pharmacy Professionals in Uganda",
      description:
        "The Pharmacy Professionals Association of Uganda (PPAU) — advocacy, CPD/CME, membership, and professional excellence for dispensers, pharmacy assistants, and allied pharmacy professionals.",
      path: "/",
      keywords:
        "PPAU, Pharmacy Professionals Association of Uganda, pharmacy Uganda, dispensers, pharmacy assistants, CPD Uganda, join PPAU",
    }),
  component: Home,
});

const heroSlides = [
  {
    image: slider1,
    title: "Taking Care of Your Health is Our Top Priority",
    description:
      "The premier professional body for pharmacy professionals in Uganda, dedicated to fostering healthcare excellence across the nation.",
  },
  {
    image: heroPpauLeadership,
    title: "Leadership You Can Trust",
    description:
      "PPAU leaders and representatives working together to advance pharmacy practice, standards, and the voice of professionals across Uganda.",
  },
  {
    image: heroPpauCommunity,
    title: "Our Strength Is Our Members",
    description:
      "A growing nationwide community of pharmacy professionals united in advocacy, learning, and service to the public.",
  },
  {
    image: heroImg3,
    title: "Professional Excellence and Advocacy",
    description:
      "Your home for continuing professional development and collaborative growth in pharmacy practice.",
  },
  {
    image: heroImg1,
    title: "Advancing Pharmacy Professionals in Uganda",
    description:
      "Empowering pharmacy professionals through advocacy, education, and professional excellence.",
  },
];

function useCounter(target: number, run: boolean, duration = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return v;
}

function StatCard({
  value,
  suffix = "+",
  label,
  run,
}: {
  value: number;
  suffix?: string;
  label: string;
  run: boolean;
}) {
  const n = useCounter(value, run);
  return (
    <div className="text-center px-4">
      <div className="text-4xl font-bold text-white mb-1">
        {n.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm text-white/75 font-medium">{label}</div>
    </div>
  );
}

function Home() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setRun(true), {
      threshold: 0.3,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <>
      {/* HERO */}
      <section
        aria-label="Hero slideshow"
        className="relative h-[88vh] min-h-[620px] lg:h-[calc(88vh-40px)] overflow-hidden"
      >
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            aria-hidden={idx !== currentSlide}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt=""
              role="presentation"
              className="absolute inset-0 h-full w-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            <div className="relative mx-auto h-full max-w-7xl px-4 lg:pl-8 lg:pr-0 flex items-center justify-center lg:justify-start">
              <div className="max-w-2xl animate-reveal">
                <span className="section-label bg-primary/80 text-white border-0 mb-6">
                  PPAU Official Body
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                  {slide.title}
                </h1>
                <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-xl">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary hover:bg-secondary text-white font-semibold px-8 rounded-full shadow-card transition-all text-sm"
                  >
                    <Link to="/membership">Become a Member</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-primary font-semibold px-8 rounded-full backdrop-blur-sm transition-all text-sm"
                  >
                    <Link to="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide indicators */}
        <div
          role="tablist"
          aria-label="Slide navigation"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20"
        >
          {heroSlides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === currentSlide}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all ${
                i === currentSlide ? "w-8 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-6 right-4 lg:right-8 flex gap-2 z-20">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-primary backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-primary backdrop-blur-sm transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* QUICK SERVICES STRIP */}
      <section aria-label="Our services" className="bg-white shadow-premium relative z-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { icon: GraduationCap, title: "CPD / CME", desc: "Accredited courses", to: "/cpd" },
              {
                icon: Megaphone,
                title: "Advocacy",
                desc: "Professional representation",
                to: "/about",
              },
              { icon: Users, title: "Membership", desc: "Join our community", to: "/membership" },
              { icon: Calendar, title: "Events", desc: "Upcoming activities", to: "/events" },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="flex items-center gap-4 px-6 py-6 hover:bg-primary/4 transition-colors group"
              >
                <div className="icon-box group-hover:scale-105 transition-transform shrink-0">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section aria-labelledby="who-we-are-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="relative animate-reveal order-2 lg:order-1">
              <img
                src={whoWeAreImg}
                alt="PPAU pharmacy professionals at work"
                loading="lazy"
                width={800}
                height={480}
                className="rounded-2xl object-cover w-full h-[480px] shadow-elegant"
              />
              <div className="absolute -bottom-6 -right-4 md:-right-8 bg-white rounded-2xl p-5 shadow-elegant border border-border">
                <div className="flex items-center gap-3">
                  <div className="icon-box w-12 h-12 rounded-xl">
                    <Award className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary leading-none">10k+</div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">
                      Members Represented
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-reveal order-1 lg:order-2">
              <span className="section-label">Who We Are</span>
              <h2
                id="who-we-are-heading"
                className="text-4xl font-bold text-foreground mb-5 leading-tight"
              >
                Welcome To PPAU, Uganda's Pharmacy Body
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                The Pharmacy Professionals Association of Uganda (PPAU) is the premier professional
                body dedicated to fostering excellence, advocacy, and continuous learning for
                pharmacy professionals across the nation.
              </p>
              <ul className="space-y-3 mb-8" aria-label="Key highlights">
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
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-primary-soft rounded-xl p-4">
                  <h3 className="font-semibold text-primary text-sm mb-1">Our Mission</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Uplifting standards of practice and ensuring effective pharmaceutical care for
                    all Ugandans.
                  </p>
                </div>
                <div className="bg-primary-soft rounded-xl p-4">
                  <h3 className="font-semibold text-primary text-sm mb-1">Our Vision</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A vibrant platform for pharmacy professionals to grow and contribute to
                    healthcare.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-primary hover:bg-secondary text-white rounded-full px-7 h-11 text-sm font-semibold"
                >
                  <Link to="/about">About PPAU</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-7 h-11 text-sm font-semibold"
                >
                  <Link to="/membership">Join Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section
        ref={statsRef}
        aria-label="Key statistics"
        className="bg-gradient-primary text-white py-16"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/20">
            <StatCard value={1800} label="Pharmacy professionals" run={run} />
            <StatCard value={255} label="Pharmacy Assistants" run={run} />
            <StatCard value={3096} label="Registered Pharmacies" run={run} />
            <StatCard value={11370} label="Licensed Drug Shops" run={run} />
          </div>
        </div>
      </section>

      {/* WHAT WE STAND FOR */}
      <section aria-labelledby="mandate-heading" className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-reveal">
            <span className="section-label">Our Mandate</span>
            <h2 id="mandate-heading" className="text-4xl font-bold text-foreground mb-4">
              Find Out More About Our Services
            </h2>
            <p className="text-muted-foreground">
              Four pillars guiding our work for Uganda's pharmacy workforce.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: GraduationCap,
                title: "Continuing Education",
                desc: "CPD/CME programs that keep members at the forefront of pharmacy practice.",
              },
              {
                icon: Megaphone,
                title: "Advocacy",
                desc: "Expert guidance and representation for pharmacy professionals nationwide.",
              },
              {
                icon: Stethoscope,
                title: "Professional Standards",
                desc: "Promoting safe, ethical, and collaborative pharmacy environments.",
              },
              {
                icon: Users,
                title: "Member Community",
                desc: "Vibrant community for collaboration, networking, and career growth.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="group bg-white rounded-2xl border border-border p-7 shadow-soft card-hover text-center"
              >
                <div className="icon-box mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <c.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-3 text-base">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{c.desc}</p>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold hover:gap-2.5 transition-all"
                  aria-label={`Read more about ${c.title}`}
                >
                  Read more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section aria-labelledby="process-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-label">Our Process</span>
            <h2 id="process-heading" className="text-4xl font-bold text-foreground mb-4">
              How We Work
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Users,
                title: "Join as a Member",
                desc: "Register as a Dispenser or pharmacy assistant and become part of Uganda's leading professional body.",
              },
              {
                step: "02",
                icon: BookOpen,
                title: "Access CPD Resources",
                desc: "Unlock accredited continuing education courses, workshops, and professional development materials.",
              },
              {
                step: "03",
                icon: Award,
                title: "Grow Your Career",
                desc: "Gain recognition, network with peers, and advance your pharmacy career with PPAU's support.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl border border-border p-8 shadow-soft card-hover"
              >
                <div
                  className="text-6xl font-black text-primary/8 absolute top-4 right-6 leading-none select-none"
                  aria-hidden="true"
                >
                  {item.step}
                </div>
                <div className="icon-box mb-5">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP HIGHLIGHT */}
      <section aria-labelledby="leadership-heading" className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="section-label">Leadership</span>
              <h2 id="leadership-heading" className="text-4xl font-bold text-foreground">
                Our Leaders
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-7 h-10 text-sm font-semibold"
            >
              <Link to="/about">View All</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Mr. Danson Sembatya", role: "President", img: presidentImg },
              { name: "KHAUKHA M.A EMMANUEL", role: "Vice President", img: vicePresidentImg },
              { name: "GWEBAYANGA COLLINE", role: "Secretary", img: secretaryImg },
              { name: "Boonabaana Bernard", role: "National Treasurer", img: treasurerImg },
            ].map((p) => (
              <div
                key={p.name}
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-soft card-hover text-center"
              >
                <div className="h-48 overflow-hidden bg-primary-soft">
                  <img
                    src={p.img}
                    alt={`${p.name}, ${p.role}`}
                    loading="lazy"
                    className="h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground text-sm mb-1">{p.name}</h3>
                  <p className="text-xs text-primary font-medium">{p.role}</p>
                  <div className="flex justify-center gap-1 mt-3" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST NEWS */}
      <section aria-labelledby="news-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="section-label">Latest Updates</span>
              <h2 id="news-heading" className="text-4xl font-bold text-foreground">
                Latest Blogs and Articles
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-7 h-10 text-sm font-semibold"
            >
              <Link to="/news">All Articles</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                tag: "Public Health",
                title:
                  "Pharmacists and Dispensers to Offer Family Planning Services in Pharmacies and Drug Dispensaries",
                date: "May 28, 2026",
                img: familyPlanningImg,
                desc: "Pharmacists and Dispensers to Offer Family Planning Services in Pharmacies and Drug Dispensaries at Sheraton Hotel",
                to: "/news/family-planning-services",
              },
              {
                tag: "News",
                title:
                  "NDA, AHPC & PPAU Meet to Consolidate Dispensers' Private Practice",
                date: "May 23, 2026",
                img: ndaMeetingImg,
                desc: "Officials from the National Drug Authority (NDA), the Allied Health Professionals Council (AHPC), and the Pharmacy Professionals' Association of Uganda (PPAU) have initiated discussions aimed at harmonizing the regulation of Dispensers' private practice in Uganda, following growing disagreements over the licensing and operation of drug shops managed by qualified Dispensers.",
                to: "/news/nda-ahpc-ppau-meeting",
              },
              {
                tag: "Advocacy",
                title:
                  "PPAU advances scope-of-practice review with the Allied Health Professionals Council.",
                date: "April 28, 2026",
                img: heroImg2,
                desc: "",
                pdf: "",
              },
              {
                tag: "Public Health",
                title:
                  "World Pharmacist Day: Dispensers at the heart of medication safety and healthcare.",
                date: "April 12, 2026",
                img: heroImg1,
                desc: "",
                pdf: "",
              },
              {
                tag: "Policy",
                title:
                  "Allied Health Drug Dispensaries: A Turning Point in the Fight Against AMR in Uganda.",
                date: "May 9, 2026",
                img: heroImg3,
                desc: "",
                pdf: "",
              },
              {
                tag: "Advocacy",
                title: "PPAU RAISES ALARM OVER DELAYED RELEASE OF TRANSCRIPTS, GIVES UHPAB THREE MONTHS TO CLEAR VERIFICATION STATEMENT BACKLOG AND SET TRANSCRIPT ISSUANCE TIMELINES",
                date: "July 13, 2026",
                img: ppauAlarmsImg,
                desc: "PPAU has issued a strong call to the Uganda Health Professionals Accreditation Board (UHPAB) demanding resolution of the prolonged verification statement backlog that continues to block graduates from accessing their transcripts. The association has given UHPAB a three-month ultimatum to clear the backlog and establish clear timelines for transcript issuance.",
                to: "/news/ppau-uhpab-transcripts",
              },
            ].map((n) => (
              <article
                key={n.title}
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-soft card-hover"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={n.img}
                    alt={n.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {n.tag}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    <time>{n.date}</time>
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-snug mb-4 group-hover:text-primary transition-colors line-clamp-3">
                    {n.title}
                  </h3>
                  {n.desc && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {n.desc}
                    </p>
                  )}
                  {n.to ? (
                    <Link
                      to={n.to}
                      className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold hover:gap-2.5 transition-all"
                      aria-label={`Read full article: ${n.title}`}
                    >
                      Read more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ) : n.pdf ? (
                    <a
                      href={n.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold hover:gap-2.5 transition-all"
                      aria-label={`Read full article: ${n.title}`}
                    >
                      Read more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <Link
                      to="/news"
                      className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold hover:gap-2.5 transition-all"
                      aria-label={`Read more about: ${n.title}`}
                    >
                      Read more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section
        aria-label="Collaborating partners"
        className="bg-white border-t border-border py-14"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-center text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.3em] mb-10">
            Collaborating Partners
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {[
              "Ministry of Health",
              "NDA Uganda",
              "Allied Health Council",
              "UNHRL",
              "WHO",
              "Pharmacy Society",
            ].map((p) => (
              <div
                key={p}
                className="flex h-16 items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <span className="text-center font-bold text-xs text-primary uppercase tracking-tight leading-tight px-2">
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section aria-label="Newsletter signup" className="bg-gradient-primary py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get the Latest Updates by Subscribing to Our Newsletter
          </h2>
          <p className="text-white/75 mb-8 max-w-xl mx-auto">
            Stay informed about CPD events, policy changes, and professional opportunities across
            Uganda.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Newsletter subscription form"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              className="flex-1 bg-white/15 border border-white/25 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              className="bg-white text-primary font-semibold px-7 py-3 rounded-full text-sm hover:bg-white/90 transition-all shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
