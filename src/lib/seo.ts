export const SITE_NAME = "PPAU";
export const SITE_URL = "https://ppau.info";
export const SITE_TITLE = "PPAU | Pharmacy Professionals Association of Uganda";
export const SITE_DESC =
  "Pharmacy Professionals Association of Uganda (PPAU) — advocacy, CPD/CME, membership, and professional standards for dispensers, pharmacy assistants, and allied pharmacy professionals.";
export const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/dbcd8b29-b972-47e9-a821-27d8bf1a861a/id-preview-7dd28aeb--c9c8b3cf-e666-4142-bbf3-2af112294c82.lovable.app-1778223180363.png";
export const TWITTER_HANDLE = "@ppau_official";
export const DEFAULT_KEYWORDS =
  "PPAU, Pharmacy Professionals Association of Uganda, pharmacy Uganda, dispensers Uganda, pharmacy assistants, CPD Uganda, AHPC, pharmacy membership, pharmacy news Uganda";

type PageHeadOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  ogType?: "website" | "article";
  image?: string;
  noindex?: boolean;
};

function withBrand(title: string) {
  if (/[|–—]/.test(title) || title.endsWith("PPAU")) return title;
  return `${title} | PPAU`;
}

export function pageHead({
  title,
  description,
  path,
  keywords = DEFAULT_KEYWORDS,
  ogType = "website",
  image = OG_IMAGE,
  noindex = false,
}: PageHeadOptions) {
  const branded = withBrand(title);
  const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  return {
    meta: [
      { title: branded },
      { name: "description", content: description },
      { name: "keywords", content: keywords },
      { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
      { name: "author", content: SITE_NAME },
      { property: "og:type", content: ogType },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: branded },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_UG" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: TWITTER_HANDLE },
      { name: "twitter:title", content: branded },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Pharmacy Professionals Association of Uganda",
  alternateName: "PPAU",
  url: SITE_URL,
  logo: `${SITE_URL}/PPAU_logo.jpeg`,
  image: OG_IMAGE,
  description: SITE_DESC,
  email: "info@ppau.info",
  telephone: "+256740657759",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kampala",
    addressCountry: "UG",
  },
  sameAs: [
    "https://twitter.com/ppau_official",
    "https://www.ppau.info",
  ],
  areaServed: {
    "@type": "Country",
    name: "Uganda",
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESC,
  publisher: {
    "@type": "Organization",
    name: "Pharmacy Professionals Association of Uganda",
  },
};
