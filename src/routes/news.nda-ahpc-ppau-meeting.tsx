import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Calendar, ArrowLeft } from "lucide-react";
import ndaMeetingImg from "@/assets/nda-ahpc-ppau-meeting.jpg.jpeg";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news/nda-ahpc-ppau-meeting")({
  head: () =>
    pageHead({
      title: "NDA, AHPC and PPAU Meet on Dispensers' Private Practice",
      description:
        "NDA, AHPC, and PPAU met to harmonize regulation of dispensers' private practice in Uganda, including licensing and operation of drug shops.",
      path: "/news/nda-ahpc-ppau-meeting",
      ogType: "article",
      keywords: "NDA AHPC PPAU, dispensers private practice, drug shop licensing Uganda",
    }),
  component: NdaAhpcPpauMeeting,
});

function NdaAhpcPpauMeeting() {
  return (
    <>
      <PageHero
        eyebrow="News"
        title="NDA, AHPC & PPAU Meet to Consolidate Dispensers' Private Practice"
        subtitle="Officials from the National Drug Authority (NDA), the Allied Health Professionals Council (AHPC), and the Pharmacy Professionals' Association of Uganda (PPAU) have initiated discussions aimed at harmonizing the regulation of Dispensers' private practice in Uganda, following growing disagreements over the licensing and operation of drug shops managed by qualified Dispensers."
      />

      <article className="section-padding bg-background">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time>May 23, 2026</time>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={ndaMeetingImg}
              alt="NDA, AHPC and PPAU officials at the tripartite meeting"
              className="w-full h-72 object-cover"
            />
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p>
              Officials from the National Drug Authority (NDA), the Allied Health Professionals Council (AHPC), and the Pharmacy Professionals' Association of Uganda (PPAU) have initiated discussions aimed at harmonizing the regulation of Dispensers' private practice in Uganda, following growing disagreements over the licensing and operation of drug shops managed by qualified Dispensers.
            </p>
            <p>
              The engagement, held on May 20, 2026, at the NDA headquarters in Kampala, focused on the ongoing regulatory impasse surrounding the licensing of Dispensers under the AHPC framework and recent enforcement actions involving Tripple D Drug Shop.
            </p>
            <p>
              The meeting brought together officials from the three institutions to explore possible areas of consensus and chart a way forward on the contentious matter that has generated concern among pharmacy professionals and regulators alike.
            </p>

            <h3 className="text-lg font-bold text-foreground">AHPC Defends Mandate on Dispensers' Licensing</h3>
            <p>
              During the discussions, the chairperson AHPC (Professor John Charles Okiria) maintained that AHPC possesses a clear legal mandate under the Allied Health Professionals Act to license Dispensers for private practice.
            </p>
            <p>
              He further emphasized that Dispensers are legally recognized allied health professionals who qualify for private practice only after completing three years of professional training, obtaining registration, and acquiring at least four years of professional experience.
            </p>
            <p>
              AHPC actions are guided by the law and legal advice from the Solicitor General and defended the legitimacy of licenses issued to Dispensers operating private drug shops.
            </p>
            <p>
              The Chairperson of AHPC reportedly defended the authenticity of the license issued to Tripple D Drug Shop, which had recently been raided and closed by NDA enforcement officials. The Council appealed to NDA to focus enforcement efforts on unqualified operators rather than licensed and trained Dispensers.
            </p>

            <h3 className="text-lg font-bold text-foreground">NDA Reaffirms Regulatory Role</h3>
            <p>
              On its part, the Secretary NDA (Dr David Nahamya) maintained that NDA is acting within its statutory mandate under the National Drug Policy and Authority Act, particularly regarding the licensing and regulation of premises such as drug shops and Class C licensed outlets.
            </p>
            <p>
              NDA officials cited the Court of Appeal ruling in the CISSE Dispenser case, arguing that while AHPC regulates professionals, NDA remains the body responsible for licensing premises involved in the sale and handling of medicines.
            </p>
            <p>
              According to NDA's legal team, the two laws largely refer to the same category of outlets, with NDA retaining the authority to issue operational licenses while AHPC focuses on professional regulation.
            </p>
            <p>
              The NDA Secretary also proposed a possible compromise through the development of a restricted schedule of medicines that could be stocked by Dispensers' drug shops.
            </p>

            <h3 className="text-lg font-bold text-foreground">PPAU Presents Historical and Legal Perspective</h3>
            <p>
              Representing PPAU, the General Secretary Dr. Gwebayanga Colline submitted that the chronology of historical events and legislation provides important context in understanding the current regulatory dispute surrounding Dispensers' private practice.
            </p>
            <p>
              Dr. Gwebayanga explained that the regulation of pharmacy practice in Uganda began with the enactment of the Pharmacy and Drugs Act of 1971, which consolidated laws relating to the profession of pharmacy, drugs, poisons, and pharmacy practice under one framework.
            </p>
            <p>
              He noted that in 1993, the mandate to regulate drugs was transferred from the Pharmacy and Drugs Act to NDA through the enactment of the National Drug Policy and Authority Act.
            </p>
            <p>
              Further changes came in 1996 when AHPC was granted powers under the Allied Health Professionals Act to regulate several professions, including pharmacy-related practice among allied health professionals. Under this framework, AHPC was empowered to license allied health units operated by Dispensers.
            </p>
            <p>
              According to PPAU, government was fully aware of the existence of both NDA-regulated licensed seller outlets and professionally licensed persons operating under AHPC.
            </p>
            <p>
              Dr. Gwebayanga argued that interpreting a licensed seller outlet to be the same as an AHPC-licensed Dispenser's drug shop is legally erroneous and amounts to a misinterpretation of the law.
            </p>
            <p>
              He further explained that NDA determines the fitness of licensed seller premises under the Class C category, whereas a Dispenser's drug shop is a professional practice reserved for Dispensers registered under AHPC and intended to provide medicines for common health conditions.
            </p>
            <p>
              PPAU emphasized that Dispensers are trained pharmacy professionals whose role within Uganda's healthcare system should be recognized within the legal and regulatory framework.
            </p>

            <h3 className="text-lg font-bold text-foreground">Way Forward</h3>
            <p>
              At the close of the meeting, the parties agreed that further dialogue and technical engagements would be necessary to harmonize the interpretation and implementation of the relevant laws.
            </p>
            <p>
              A smaller technical committee comprising representatives from the involved institutions is expected to continue discussions and guide future engagements.
            </p>
            <p>
              AHPC also requested NDA to temporarily suspend enforcement actions targeting Dispensers' drug shops pending the outcome of the discussions, while NDA indicated that matters concerning impounded medicines and future regulatory direction would be addressed through subsequent engagements and established procedures.
            </p>
            <p>
              The meeting marked a significant step toward resolving long-standing regulatory concerns surrounding Dispensers' private practice and highlighted the need for coordinated collaboration among Uganda's health regulatory bodies.
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
