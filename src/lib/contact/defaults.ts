export type ContactItemIcon = "phone" | "mail" | "mapPin" | "clock";

export type ContactItem = {
  icon: ContactItemIcon;
  label: string;
  value: string;
  sub?: string;
  href?: string | null;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type ContactPageSettings = {
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  section_label: string;
  section_title: string;
  section_description: string;
  contact_items: ContactItem[];
  social_links: SocialLink[];
  map_embed_url: string;
  form_title: string;
  form_description: string;
  form_submit_label: string;
  success_message: string;
  notification_email: string | null;
  form_enabled: boolean;
  is_published: boolean;
};

export const DEFAULT_CONTACT_PAGE: ContactPageSettings = {
  hero_eyebrow: "Contact",
  hero_title: "Connect With PPAU",
  hero_subtitle:
    "We would love to hear from you. Reach out about membership, events, or partnerships.",
  section_label: "Get in Touch",
  section_title: "We're Here to Help",
  section_description:
    "Whether you have questions about membership, upcoming events, or professional development, our team is ready to assist you.",
  contact_items: [
    {
      icon: "phone",
      label: "Phone",
      value: "+256 740 657759",
      sub: "Mon to Fri, 9:00 AM to 5:00 PM EAT",
      href: "tel:+256740657759",
    },
    {
      icon: "mail",
      label: "General enquiries",
      value: "info@ppau.info",
      sub: "We reply within 24 hours",
      href: "mailto:info@ppau.info",
    },
    {
      icon: "mail",
      label: "Secretary",
      value: "ppausecretary@gmail.com",
      sub: "Secretariat and membership correspondence",
      href: "mailto:ppausecretary@gmail.com",
    },
    {
      icon: "mail",
      label: "President",
      value: "ppau.ltd@gmail.com",
      sub: "Office of the President",
      href: "mailto:ppau.ltd@gmail.com",
    },
    {
      icon: "mapPin",
      label: "Office",
      value: "Nakawa, Kampala, Uganda",
      sub: "Visit us during office hours",
      href: null,
    },
    {
      icon: "clock",
      label: "Office Hours",
      value: "Mon to Fri: 9:00 AM to 5:00 PM",
      sub: "East Africa Time (EAT)",
      href: null,
    },
  ],
  social_links: [
    { label: "X (Twitter) @ppau_official", href: "https://twitter.com/ppau_official" },
    { label: "TikTok @ppau_official", href: "https://www.tiktok.com/@ppau_official" },
  ],
  map_embed_url: "https://www.google.com/maps?q=Nakawa,Kampala,Uganda&output=embed",
  form_title: "Send a Message",
  form_description: "Fill in the form below and we will get back to you shortly.",
  form_submit_label: "Send Message",
  success_message: "Your message was received. We will be in touch soon.",
  notification_email: "info@ppau.info",
  form_enabled: true,
  is_published: true,
};

export type ContactSubmission = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
};
