import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Calendar, ArrowLeft } from "lucide-react";
import ppauAlarmsImg from "@/assets/ppau-alarms-transcripts.jpg.jpg";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news/ppau-uhpab-transcripts")({
  head: () =>
    pageHead({
      title: "PPAU Raises Alarm Over Delayed UHPAB Transcripts",
      description:
        "PPAU has given UHPAB three months to clear the verification statement backlog and set clear timelines for issuing academic transcripts to health professional graduates.",
      path: "/news/ppau-uhpab-transcripts",
      ogType: "article",
      keywords: "UHPAB transcripts, PPAU verification statements, pharmacy graduates Uganda",
    }),
  component: PpauUhpabTranscripts,
});

function PpauUhpabTranscripts() {
  return (
    <>
      <PageHero
        eyebrow="Advocacy"
        title="PPAU Raises Alarm Over Delayed Release of Transcripts, Gives UHPAB Three Months to Clear Verification Statement Backlog and Set Transcript Issuance Timelines"
        subtitle="The Pharmacy Professionals' Association of Uganda (PPAU) has called on the Uganda Health Professions Assessment Board (UHPAB) to urgently address the prolonged delays in the release of academic transcripts and verification statements for health professional graduates."
      />

      <article className="section-padding bg-background">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time>July 13, 2026</time>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={ppauAlarmsImg}
              alt="PPAU logo — advocacy for transcript release"
              className="w-full h-72 object-cover"
            />
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p>
              The Pharmacy Professionals' Association of Uganda (PPAU) has called on the Uganda Health Professions Assessment Board (UHPAB) to urgently address the prolonged delays in the release of academic transcripts and verification statements for health professional graduates, warning that the situation is disrupting professional registration, employment, and career progression for hundreds of graduates.
            </p>
            <p>
              The call follows a consultative meeting convened by PPAU, which brought together affected graduates and stakeholders to assess the extent of the problem and gather experiences from across training institutions.
            </p>
            <p>
              According to PPAU, the consultations established that many graduates who completed their training over a year ago are still waiting for their official academic transcripts. Although UHPAB announced in May 2026 that it would issue verification statements as a temporary measure to facilitate registration with the Allied Health Professionals Council (AHPC) and enable graduates to seek employment, the Association says many eligible graduates have not received even those documents.
            </p>
            <p>
              PPAU further noted that several training institutions submitted lists of affected students to UHPAB but have received little or no feedback regarding the status of the applications. In some cases, institutions have advised individual graduates to personally follow up at UHPAB offices due to increasing pressure from students seeking assistance.
            </p>

            <h3 className="text-lg font-bold text-foreground">Graduates Left Stranded</h3>
            <p>
              "The uncertainty surrounding the release of these documents has left many graduates stranded," Dr GWEBAYANGA Colline said. "Without transcripts or verification statements, many are unable to complete professional registration, secure employment opportunities, or pursue further studies."
            </p>
            <p>
              The Association also expressed concern over graduates who completed under the former Uganda Allied Health Examinations Board (UAHEB) before its merger into UHPAB, noting that some who completed in 2022, 2023, and 2024 are still awaiting their academic transcripts.
            </p>

            <h3 className="text-lg font-bold text-foreground">Verification Statements Not a Substitute</h3>
            <p>
              While acknowledging the introduction of verification statements as an interim intervention, PPAU emphasized that such documents cannot replace official academic transcripts, which remain essential for postgraduate admissions, scholarship applications, professional mobility, and long-term career development.
            </p>
            <p>
              The Association warned that unless the matter is addressed promptly, Uganda risks creating a growing backlog in which verification statements become a routine substitute for transcripts, placing an unnecessary administrative burden on both graduates and UHPAB in the future.
            </p>

            <h3 className="text-lg font-bold text-foreground">Demands to UHPAB</h3>
            <p>
              In a formal communication to UHPAB, PPAU has called upon the board to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Complete the processing and release of all pending verification statements for all eligible graduates within the next three months</li>
              <li>Communicate clear timelines for ending the issuance of verification statements and commencing the release of official transcripts</li>
              <li>Provide regular feedback to training institutions on pending cases</li>
              <li>Prioritize transcript issuance for graduates who completed under the former UAHEB</li>
            </ul>
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