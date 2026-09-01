import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Calendar, ArrowLeft } from "lucide-react";
import heroImg1 from "@/assets/ppau-ndhpact-alarm-1.jpeg";
import heroImg2 from "@/assets/ppau-ndhpact-alarm-2.jpeg";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news/ppau-ndhpact-alarm")({
  head: () =>
    pageHead({
      title: "PPAU Sounds Alarm Over Suspected Plot to Alter Drug Law",
      description:
        "PPAU has written to the Attorney General over reported plans to amend the NDHPA Act, 2026, warning that changes could threaten Diploma in Pharmacy holders' private practice rights.",
      path: "/news/ppau-ndhpact-alarm",
      ogType: "article",
      keywords: "NDHPA Act, dispensers private practice, PPAU Attorney General, drug law Uganda",
    }),
  component: PpauNdhpactAlarm,
});

function PpauNdhpactAlarm() {
  return (
    <>
      <PageHero
        eyebrow="Policy"
        title="PPAU Sounds Alarm Over Suspected Plot to Alter Drug Law, Warns Thousands of Dispensers Could Lose Private Practice Rights"
        subtitle="The Pharmacy Professionals' Association of Uganda (PPAU) has written to the Attorney General expressing concern over reported plans to amend the recently enacted National Drug and Health Products Authority (NDHPA) Act, 2026."
      />

      <article className="section-padding bg-background">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time>July 13, 2026</time>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={heroImg1}
              alt="PPAU letter to the Attorney General regarding the NDHPA Act"
              className="w-full h-72 object-cover"
            />
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={heroImg2}
              alt="PPAU correspondence on proposed amendments to the NDHPA Act"
              className="w-full h-72 object-cover"
            />
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p>
              The Pharmacy Professionals' Association of Uganda (PPAU) has written to the Attorney General expressing concern over reported plans to amend the recently enacted National Drug and Health Products Authority (NDHPA) Act, 2026, warning that any changes could threaten the legal rights of Diploma in Pharmacy holders to engage in private practice.
            </p>
            <p>
              In a letter dated July 13, 2026, signed by PPAU President Sembatya Danson, the association said it had received information that the National Drug Authority (NDA) had formally requested the Attorney General's office to consider amendments to the new law.
            </p>
            <p>
              Although PPAU acknowledged that newly enacted legislation may require technical corrections or harmonisation, it noted that the association had not been informed about the specific provisions the NDA intends to amend.
            </p>
            <p>
              The association warned that any amendments touching on professional regulation must be subjected to careful legal scrutiny to avoid reversing rights that pharmacy professionals have already acquired under existing legislation.
            </p>

            <h3 className="text-lg font-bold text-foreground">Legal Basis for Dispensers' Private Practice</h3>
            <p>
              PPAU emphasized that the private practice rights of Dispensers (holders of a Diploma in Pharmacy) are not created by the NDHPA Act but are operationalised under the Allied Health Professionals Act (Cap. 296), which empowers the Allied Health Professionals Council (AHPC) to regulate allied health professionals, determine their scope of practice, register and license practitioners, and license eligible professionals for private practice.
            </p>
            <p>
              According to the association, Dispensers who have attained the prescribed four years of professional experience are legally eligible to obtain private practice licences from AHPC to operate drug shops.
            </p>

            <h3 className="text-lg font-bold text-foreground">Contrast With Repealed Law</h3>
            <p>
              The letter contrasts this framework with the repealed National Drug Policy and Authority Act, under which the National Drug Authority licensed Class C drug shops and could issue outlet licences to individuals it considered suitable, including nurses, midwives and pharmacy assistants, because those facilities offered a more limited scope of pharmaceutical services.
            </p>

            <h3 className="text-lg font-bold text-foreground">Solicitor General's Guidance</h3>
            <p>
              PPAU further cited guidance previously issued by the Solicitor General clarifying the mandates of the two institutions. According to that guidance, AHPC is responsible for licensing health professionals and their professional practice, while the NDA regulates medicines and health products by ensuring their quality, safety and efficacy.
            </p>
            <p>
              The association argues that this legal distinction should remain intact and that any amendments to the NDHPA Act should not create uncertainty over the professional mandate of AHPC or the private practice rights already recognised for Dispensers.
            </p>

            <h3 className="text-lg font-bold text-foreground">PPAU's Appeal</h3>
            <p>
              PPAU has appealed to the Attorney General to safeguard the statutory powers of professional regulatory councils and preserve the lawful rights of regulated health professionals.
            </p>
            <p>
              The association also called for broad stakeholder consultations before any amendments affecting professional regulation are considered, arguing that changes to such laws should involve the affected professional bodies in line with the principles of transparency, good governance and legitimate expectation.
            </p>
            <p>
              The development comes only months after Parliament enacted the National Drug and Health Products Authority Act, 2026, legislation that restructured Uganda's medicines regulatory framework and introduced new institutional mandates within the health sector.
            </p>
            <p>
              PPAU says it hopes the Attorney General's office will carefully evaluate any proposed amendments to ensure they do not unintentionally erode the legal protections and professional rights currently enjoyed by Uganda's pharmacy professionals.
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
