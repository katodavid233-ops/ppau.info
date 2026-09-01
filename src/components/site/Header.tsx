import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/PPAU_logo.jpeg";

const CPD_CME_URL = "https://ppau-cme-cpd.org";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/committee", label: "Committee" },
  { to: "/membership", label: "Membership" },
  { href: CPD_CME_URL, label: "CPD/CME" },
  { to: "/events", label: "Events" },
  { to: "/news", label: "News" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-primary text-white hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex items-center justify-between h-9 text-[11px]">
          <span className="opacity-80">Advancing Pharmacy Professionals in Uganda</span>
          <div className="flex items-center gap-6 opacity-80 flex-wrap justify-end">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> +256 740 657759
            </span>
            <a href="mailto:info@ppau.info" className="hover:underline">
              info@ppau.info
            </a>
            <span className="hidden xl:inline text-white/60">|</span>
            <Link to="/member/login" className="hover:underline font-medium text-white">
              Member login
            </Link>
            <span className="hidden xl:inline text-white/60">|</span>
            <a
              href="https://twitter.com/ppau_official"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              @ppau_official
            </a>
            <a
              href="https://www.tiktok.com/@ppau_official"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="glass-navbar transition-all duration-300">
        <div className="mx-auto flex h-20 max-w-7xl items-center px-4 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img src={logo} alt="PPAU logo" className="h-12 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-primary tracking-tight">PPAU</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide hidden sm:block">
                Pharmacy Professionals Association of Uganda
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-auto mr-6">
            {nav.map((n) =>
              "href" in n ? (
                <a
                  key={n.href}
                  href={n.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 text-[12px] font-medium text-foreground/70 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                >
                  {n.label}
                </a>
              ) : (
                <Link
                  key={n.to}
                  to={n.to}
                  className="px-3.5 py-2 text-[12px] font-medium text-foreground/70 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                  activeProps={{ className: "text-primary font-semibold bg-primary/8" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              ),
            )}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full text-[12px] font-semibold border-primary/30 text-primary hover:bg-primary/5"
            >
              <Link to="/member/login">Member login</Link>
            </Button>
            <Button
              asChild
              className="bg-primary hover:bg-secondary text-white font-semibold px-6 h-10 rounded-full text-[12px] shadow-card transition-all"
            >
              <Link to="/membership">Join Now</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="ml-auto lg:hidden p-2 text-primary rounded-lg hover:bg-primary/5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-border bg-white animate-reveal">
            <div className="px-4 py-5 flex flex-col gap-1">
              {nav.map((n) =>
                "href" in n ? (
                  <a
                    key={n.href}
                    href={n.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    {n.label}
                  </a>
                ) : (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 hover:bg-primary/5 hover:text-primary transition-all"
                    activeProps={{ className: "bg-primary/8 text-primary font-semibold" }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    {n.label}
                  </Link>
                ),
              )}
              <Link
                to="/member/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-primary border border-primary/30 hover:bg-primary/5 transition-all mt-2 text-center"
              >
                Member login
              </Link>
              <Button asChild className="mt-3 bg-primary rounded-xl h-12 font-semibold text-sm">
                <Link to="/membership" onClick={() => setOpen(false)}>
                  Join PPAU
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
