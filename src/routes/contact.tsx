import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { Phone, Mail, MapPin, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { fetchPublicContactPage, submitContactForm } from "@/lib/contact/api";
import type { ContactItemIcon } from "@/lib/contact/defaults";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const ICON_MAP = {
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  clock: Clock,
} as const;

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Contact PPAU",
      description:
        "Contact the Pharmacy Professionals Association of Uganda by phone, email, or visit our Kampala office. We welcome membership, CPD, and partnership enquiries.",
      path: "/contact",
      keywords: "contact PPAU, PPAU Kampala, info@ppau.info, pharmacy association Uganda contact",
    }),
  component: Contact,
});

function Contact() {
  const { data: page, isLoading } = useQuery({
    queryKey: ["public-contact-page"],
    queryFn: fetchPublicContactPage,
  });

  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!page?.form_enabled) {
      toast.error("The contact form is temporarily unavailable.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("fullName") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const subject = String(fd.get("subject") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    if (!full_name || !email || !subject || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await submitContactForm({
        full_name,
        email,
        phone: phone || undefined,
        subject,
        message,
      });
      setSent(true);
      e.currentTarget.reset();
      toast.success(page.success_message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading && isSupabaseConfigured) {
    return (
      <div className="section-padding flex justify-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      </div>
    );
  }

  const content = page!;

  return (
    <>
      <PageHero
        eyebrow={content.hero_eyebrow}
        title={content.hero_title}
        subtitle={content.hero_subtitle}
      />

      <section aria-labelledby="contact-heading" className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <span className="section-label">{content.section_label}</span>
              <h2 id="contact-heading" className="text-3xl font-bold text-foreground mb-4">
                {content.section_title}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {content.section_description}
              </p>

              <ul className="space-y-5 mb-8" aria-label="Contact details">
                {content.contact_items.map((item) => {
                  const Icon = ICON_MAP[item.icon as ContactItemIcon] ?? Mail;
                  return (
                    <li key={`${item.label}-${item.value}`} className="flex items-start gap-4">
                      <div className="icon-box shrink-0">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                          {item.label}
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="font-semibold text-foreground text-sm hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <div className="font-semibold text-foreground text-sm">{item.value}</div>
                        )}
                        {item.sub && (
                          <div className="text-xs text-muted-foreground">{item.sub}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {content.social_links.length > 0 && (
                <div className="mb-8 rounded-2xl border border-border bg-primary-soft/40 px-5 py-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Social media
                  </h3>
                  <ul className="flex flex-wrap gap-4 text-sm font-semibold">
                    {content.social_links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {content.map_embed_url && (
                <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
                  <iframe
                    title="PPAU office location on Google Maps"
                    className="w-full h-64"
                    src={content.map_embed_url}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="bg-white rounded-2xl border border-border p-8 shadow-soft">
                <h2 className="text-2xl font-bold text-foreground mb-2">{content.form_title}</h2>
                <p className="text-sm text-muted-foreground mb-6">{content.form_description}</p>

                {sent && (
                  <div
                    role="alert"
                    className="rounded-xl bg-primary-soft border border-primary/20 px-4 py-3 text-sm text-primary font-medium mb-5"
                  >
                    {content.success_message}
                  </div>
                )}

                {!content.form_enabled ? (
                  <p className="text-sm text-muted-foreground">
                    The contact form is currently unavailable. Please use the details on the left to reach us.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="full-name"
                          className="text-xs font-semibold text-foreground/70 uppercase tracking-widest block mb-1.5"
                        >
                          Full Name <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="full-name"
                          name="fullName"
                          required
                          autoComplete="name"
                          placeholder="Your full name"
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="text-xs font-semibold text-foreground/70 uppercase tracking-widest block mb-1.5"
                        >
                          Email <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          required
                          type="email"
                          autoComplete="email"
                          placeholder="your@email.com"
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="text-xs font-semibold text-foreground/70 uppercase tracking-widest block mb-1.5"
                      >
                        Phone (optional)
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+256 ..."
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="text-xs font-semibold text-foreground/70 uppercase tracking-widest block mb-1.5"
                      >
                        Subject <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        required
                        placeholder="How can we help?"
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="text-xs font-semibold text-foreground/70 uppercase tracking-widest block mb-1.5"
                      >
                        Message <span aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Tell us more..."
                        rows={5}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary hover:bg-secondary text-white font-semibold rounded-full h-12"
                    >
                      {submitting ? "Sending…" : content.form_submit_label}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
