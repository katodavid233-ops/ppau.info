import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Send } from "lucide-react";
import logo from "@/assets/PPAU_logo.jpeg";

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 3 3 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0d2b27] text-white">
      {/* Newsletter strip */}
      <div className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Stay Updated</h3>
            <p className="text-white/75 text-sm">
              Get the latest pharmacy news, CPD events, and policy updates.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white/15 border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-full text-sm hover:bg-white/90 transition-all shrink-0"
            >
              <Send className="h-4 w-4" /> Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img
                src={logo}
                alt="PPAU logo"
                className="h-12 w-auto brightness-0 invert opacity-90"
              />
              <span className="text-xl font-bold text-white">PPAU</span>
            </Link>
            <p className="text-white/55 text-sm leading-relaxed mb-6">
              The Pharmacy Professionals Association of Uganda — advancing healthcare excellence and
              professional standards nationwide.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://twitter.com/ppau_official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-primary hover:text-white transition-all"
                aria-label="PPAU on X (Twitter) @ppau_official"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@ppau_official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-primary hover:text-white transition-all"
                aria-label="PPAU on TikTok @ppau_official"
              >
                <TikTokGlyph className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-primary hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-primary hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/about", label: "About Us" },
                { to: "/committee", label: "Committees" },
                { to: "/membership", label: "Membership" },
                { href: "https://ppau-cme-cpd.org", label: "CPD / CME" },
                { to: "/events", label: "Events" },
                { to: "/news", label: "News & Updates" },
                { to: "/community", label: "Community" },
                { to: "/registered-subscribed-members", label: "Registered members" },
                { to: "/training-institutions", label: "Training institutions" },
                { to: "/strategic-plan", label: "Strategic plan" },
              ].map((item) => (
                <li key={item.label}>
                  {"href" in item ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/55 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.to} className="text-white/55 hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-widest">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-white/55">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Member Portal
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Practice Standards
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Regulatory Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  CPD Curriculum
                </a>
              </li>
              <li>
                <Link to="/resources" className="hover:text-primary transition-colors">
                  Resource Library
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-widest">
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm text-white/55">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                Nakawa, Kampala, Uganda
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                +256 740 657759
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:info@ppau.info" className="hover:text-primary transition-colors">
                  info@ppau.info
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <Link
                to="/membership"
                className="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-full text-sm transition-all"
              >
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/35">
          <p>
            © {new Date().getFullYear()} Pharmacy Professionals Association of Uganda. All rights
            reserved. Powered by <a href="https://www.gictafrica.com" className="hover:text-white/70 transition-colors">GICT Technologies Africa</a>
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/70 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
