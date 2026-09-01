import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Calendar, ArrowLeft } from "lucide-react";
import heroImg from "@/assets/ppau-pharmacy-marketing.jpeg";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news/pharmacy-professionals-marketing")({
  head: () =>
    pageHead({
      title: "PPAU Urges Firms to Hire Qualified Pharmacy Professionals for Marketing Jobs",
      description:
        "PPAU advises importers, manufacturers, wholesalers, and distributors to engage only registered pharmacy professionals for scientific promotion and representation of medicines.",
      path: "/news/pharmacy-professionals-marketing",
      ogType: "article",
    }),
  component: PharmacyProfessionalsMarketing,
});

function PharmacyProfessionalsMarketing() {
  return (
    <>
      <PageHero
        eyebrow="Advocacy"
        title="PPAU Urges Pharmaceutical Companies to Hire Only Qualified Pharmacy Professionals for Marketing Jobs"
        subtitle="The Pharmacy Professionals Association of Uganda (PPAU) has issued a strong advice to all importers, manufacturers, wholesalers, and distributors of medicines, pharmaceutical supplies, and related health products, calling on them to engage only registered pharmacy professionals for positions involving the scientific promotion and representation of medicines."
      />

      <article className="section-padding bg-background">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time>July 13, 2026</time>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={heroImg}
              alt="PPAU notice on pharmaceutical marketing recruitment"
              className="w-full h-72 object-cover"
            />
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p>
              The Pharmacy Professionals Association of Uganda (PPAU) has issued a strong advice to all importers, manufacturers, wholesalers, and distributors of medicines, pharmaceutical supplies, and related health products, calling on them to engage only registered pharmacy professionals for positions involving the scientific promotion and representation of medicines.
            </p>
            <p>
              In a general notice dated 13 July 2026 (Ref: PPAU/081/07/26) and signed by Secretary Gwebayanga Colline, the association reminded stakeholders that the promotion, representation, and dissemination of scientific and technical information on medicines constitutes "pharmacy practice." These roles, PPAU stated, require adequate training in pharmacy, competence, and ethical accountability to ensure healthcare professionals and the public receive accurate, balanced, and evidence-based information.
            </p>

            <h3 className="text-lg font-bold text-foreground">Concern Over Non-Pharmacy Recruits</h3>
            <p>
              "It has come to the attention of PPAU that several pharmaceutical companies continue to recruit individuals who are not pharmacy professionals into positions variously designated as medical representative (medical rep), sales representative (sales rep), marketer and other related designations whose primary responsibility is the scientific promotion and representation of medicines," the notice reads.
            </p>
            <p>
              PPAU described the practice as inconsistent with the principles of good pharmacy practice and warned that it undermines efforts to promote the rational use of medicines. The association stressed that the promotion of pharmaceutical products "should not be treated as an ordinary commercial sales function. It demands a sound understanding of pharmacology, therapeutics, dosage forms, medicine safety, adverse drug reactions, contraindications, drug interactions, storage requirements, regulatory requirements and professional ethics."
            </p>

            <h3 className="text-lg font-bold text-foreground">Call for Proper Recruitment</h3>
            <p>
              Uganda's pharmacy workforce includes pharmacists, pharmaceutical scientists, dispensers, and pharmacy assistants. PPAU urged companies to ensure that such positions are filled by registered pharmacy professionals, with the appropriate cadre determined by the nature of responsibilities, level of technical engagement, and organisational structure. Preference should be given to suitably trained pharmacy personnel.
            </p>
            <p>
              The association further called on employers to review their recruitment policies, job descriptions, and human resource practices to align with accepted standards of pharmacy practice.
            </p>

            <h3 className="text-lg font-bold text-foreground">Ongoing Engagement</h3>
            <p>
              PPAU said it will continue engaging government agencies, employers, and industry stakeholders to promote professional standards in pharmaceutical marketing and safeguard the quality of information provided to healthcare professionals and the public.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <Link
              to="/news"
              className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold hover:gap-2.5 transition-all"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to News
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
