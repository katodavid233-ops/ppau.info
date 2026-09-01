import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Calendar, ArrowLeft } from "lucide-react";
import familyPlanningImg from "@/assets/Pharmacists and Dispensers to Offer Family Planning Services in Pharmacies and Drug Dispensaries.jpg.jpg";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news/family-planning-services")({
  head: () =>
    pageHead({
      title: "Pharmacists and Dispensers to Offer Family Planning Services",
      description:
        "The Ministry of Health and PATH Uganda are expanding family planning access through pharmacies and drug dispensaries, with pharmacists and dispensers playing a greater role.",
      path: "/news/family-planning-services",
      ogType: "article",
    }),
  component: FamilyPlanningServices,
});

function FamilyPlanningServices() {
  return (
    <>
      <PageHero
        eyebrow="Public Health"
        title="Pharmacists and Dispensers to Offer Family Planning Services in Pharmacies and Drug Dispensaries"
        subtitle="The Ministry of Health, in partnership with PATH Uganda, has intensified efforts to expand access to family planning services through the private healthcare sector, with pharmacists and dispensers expected to play a greater role in service delivery across the country."
      />

      <article className="section-padding bg-background">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time>May 28, 2026</time>
          </div>

          <div className="mb-8 overflow-hidden rounded-2xl">
            <img
              src={familyPlanningImg}
              alt="Pharmacists and Dispensers to Offer Family Planning Services"
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p>
              This development comes amid growing concern over the increasing rates of unintended pregnancies, teenage pregnancies, unsafe abortions, maternal health complications, school dropouts, child neglect, and the rising socio-economic burden on families and the national healthcare system.
            </p>
            <p>
              Under the proposed initiative, pharmacies, drug dispensaries, and drug shops are being identified as strategic access points for family planning services due to their accessibility and growing role as first points of contact for patients seeking healthcare services.
            </p>
            <p>
              According to officials involved in the ongoing stakeholder engagements, plans are underway to accredit pharmacies, drug dispensaries, and drug shops to provide injectable family planning services in a move aimed at improving accessibility, convenience, and community-based reproductive healthcare services throughout Uganda.
            </p>
            <p>
              The consultative meetings have brought together several key health sector stakeholders, including the Pharmacy Professionals Association of Uganda (PPAU), Uganda Medical Association (UMA), Pharmaceutical Society of Uganda (PSU), National Drug Authority (NDA), Medical Clinical Officers Professionals' Association of Uganda (MCOPU), Ministry of Health officials, as well as representatives of nurses and midwives.
            </p>
            <p>
              Stakeholders described the collaboration as a major step towards strengthening reproductive health services and promoting a multi-sectoral approach to family planning implementation in Uganda.
            </p>
            <p>
              During one of the stakeholder meetings, Dr. GWEBAYANGA Colline, Secretary of the Pharmacy Professionals Association of Uganda (PPAU), presented on the integration of family planning into Continuing Professional Development (CPD) programs for dispensers. He emphasized the importance of equipping frontline pharmacy professionals with the knowledge, competencies, and practical skills necessary to support safe and effective family planning service delivery.
            </p>
            <p>
              Dr. GWEBAYANGA further proposed Mr. Nathan Muyinda, Chairperson of the PPAU CPD Committee, as the focal person to work closely with PATH Uganda and the Ministry of Health in coordinating the implementation of the CPD program and supporting the nationwide rollout of family planning services through pharmacies and drug dispensaries.
            </p>
            <p>
              PPAU reaffirmed its commitment to supporting the Ministry of Health and development partners in implementing public health programs aimed at improving healthcare access and patient outcomes.
            </p>
            <p>
              The association also reiterated that the role of pharmacy professionals has evolved significantly beyond traditional dispensing functions to broader patient-centered healthcare services. These expanded responsibilities now include health promotion, disease prevention, patient counseling, and family planning service provision, all of which are essential in improving public health outcomes within communities.
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
