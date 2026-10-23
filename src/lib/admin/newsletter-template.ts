export const NEWSLETTER_BANNER_URL = "https://ppau.info/images/ppau-newsletter-banner.png";

export const NEWSLETTER_DEFAULT_SUBJECT = "PPAU Professional Newsletter — {{issue_date}}";

export const NEWSLETTER_TEMPLATE = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>PPAU Professional Newsletter</title>
<!--
  Merge tags filled by the site when sending:
  - {{first_name}} per member.
  - {{issue_number}}, {{issue_date}} filled from the admin newsletter form.
  - {{view_online_url}}, {{unsubscribe_url}} default to the PPAU website / contact page.
-->
<style>
  body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%}
  a{color:#0b6e4f}
  ul{margin:0 0 20px;padding-left:22px}
  li{margin:0 0 10px}
  @media screen and (max-width:620px){
    .container{width:100%!important}
    .pad{padding-left:20px!important;padding-right:20px!important}
  }
  @media (prefers-color-scheme:dark){
    .bg-page{background-color:#101513!important}
    .bg-card{background-color:#1b2320!important}
    .text-main{color:#eef2ef!important}
    .text-soft{color:#b3beb8!important}
    .rule{border-color:#33403a!important}
    a{color:#7fd6b4!important}
    .btn a{color:#ffffff!important}
  }
</style>
</head>
<body class="bg-page" style="margin:0;padding:0;background-color:#eef1ee;">

<!-- Preheader: the short preview line shown in inboxes -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eef1ee;font-size:1px;line-height:1px;">
  October 2026 Edition — Drug dispensary standards, 2026 AGM, mandatory CPD and AMR awareness.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-page" style="background-color:#eef1ee;">
<tr><td align="center" style="padding:24px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container" style="width:600px;max-width:600px;">

    <!-- View online -->
    <tr><td align="center" class="text-soft" style="padding:0 0 12px;font:13px/1.4 Arial,Helvetica,sans-serif;color:#5b6761;">
      Trouble reading this email? <a href="{{view_online_url}}" style="color:#0b6e4f;">View it in your browser</a>
    </td></tr>

    <!-- Header banner image (hosted on the PPAU website) -->
    <tr><td bgcolor="#0b6e4f" style="background-color:#0b6e4f;border-radius:8px 8px 0 0;font-size:0;line-height:0;">
      <a href="https://ppau.info" style="text-decoration:none;">
        <img src="{{NEWSLETTER_BANNER_URL}}" width="600" alt="PPAU Member Newsletter" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:8px 8px 0 0;font:bold 28px/1.4 Georgia,'Times New Roman',serif;color:#ffffff;">
      </a>
    </td></tr>
    <tr><td bgcolor="#0b4d38" class="pad" align="center" style="background-color:#0b4d38;padding:10px 32px;font:13px/1.4 Arial,Helvetica,sans-serif;color:#d6efe5;">
      PPAU PROFESSIONAL NEWSLETTER &nbsp;|&nbsp; {{issue_date}} Edition
    </td></tr>

    <!-- Body card -->
    <tr><td bgcolor="#ffffff" class="bg-card pad" style="background-color:#ffffff;padding:32px;">

      <!-- Greeting -->
      <p class="text-main" style="margin:0 0 14px;font:bold 22px/1.3 Georgia,'Times New Roman',serif;color:#1f2933;">Dear {{first_name}},</p>
      <p class="text-main" style="margin:0 0 24px;font:16px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        Welcome to the October 2026 edition of the PPAU Professional Newsletter — private practice standards,
        the 2026 AGM countdown, mandatory CPD and the November AMR campaign.
      </p>

      <!-- Lead story -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #cfe3da;border-left:5px solid #e0a100;border-radius:6px;" class="rule">
        <tr><td style="padding:20px 22px;">
          <p style="margin:0 0 6px;font:bold 12px/1.2 Arial,Helvetica,sans-serif;color:#9a6c00;text-transform:uppercase;letter-spacing:1px;">Lead story</p>
          <p class="text-main" style="margin:0 0 8px;font:bold 20px/1.3 Georgia,'Times New Roman',serif;color:#1f2933;">PPAU steers improvement in Dispensers&rsquo; private practice regulation</p>
          <p class="text-soft" style="margin:0 0 6px;font:14px/1.5 Arial,Helvetica,sans-serif;color:#5b6761;">Sets Basic Requirements and Minimum Standards for Drug Dispensaries</p>
          <img src="https://ppau.info/images/newsletter-private-practice.jpeg" width="600" alt="Drug dispensary private practice" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:6px;margin:12px 0 14px;">
          <p class="text-main" style="margin:0 0 14px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
            The Pharmacy Professionals&rsquo; Association of Uganda (PPAU) has consolidated and finalised its review of the
            <strong>Basic Requirements and Minimum Standards for a Drug Dispensary</strong>. This marks an important milestone in the
            advancement of Dispenser-led private practice in Uganda.
          </p>
          <p class="text-main" style="margin:0 0 14px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
            The review provides a clear, practical and professional framework for Dispensers who intend to establish and operate
            Drug Dispensaries in accordance with the applicable regulatory framework. It promotes standardisation of premises,
            personnel, equipment, medicines management, records, service delivery, infection prevention, storage and other
            requirements relevant to safe and quality pharmaceutical care.
          </p>
          <p class="text-main" style="margin:0 0 14px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
            For PPAU, private practice is not merely about opening an outlet. It is about creating a regulated professional
            environment in which a Dispenser can provide pharmaceutical services within their lawful scope while maintaining
            appropriate standards of patient safety and public health.
          </p>
          <p class="text-main" style="margin:0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
            PPAU will continue engaging relevant stakeholders to ensure that the standards contribute to a practical, sustainable
            and professionally accountable model of Drug Dispensary practice.
          </p>
        </td></tr>
      </table>

      <!-- Section: AGM -->
      <p class="text-main" style="margin:32px 0 12px;font:bold 18px/1.3 Georgia,'Times New Roman',serif;color:#1f2933;border-bottom:2px solid #e0a100;padding-bottom:6px;">PPAU 2026 AGM is on a countdown</p>

      <img src="https://ppau.info/images/newsletter-agm.jpeg" width="600" alt="PPAU 2026 Annual General Meeting" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:6px;margin:0 0 16px;">

      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        The 2026 PPAU Annual General Meeting (AGM) is set for <strong>November</strong>. The AGM remains one of the Association&rsquo;s
        most important annual platforms for bringing together Dispensers, Pharmacy Assistants, students, leaders and other
        stakeholders to reflect on the progress of the profession and determine the priorities ahead.
      </p>

      <p class="text-main" style="margin:0 0 8px;font:bold 16px/1.4 Arial,Helvetica,sans-serif;color:#1f2933;">What should members expect?</p>
      <ul class="text-main" style="font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        <li>
          <strong>Mandatory CPD on private practice for Dispensers</strong> — all you need to know on opening and managing a drug
          dispensary: minimum standards, regulatory aspects, threats and opportunities.
        </li>
        <li>
          <strong>Exploring new opportunities in pharmacy practice</strong> — experts will share ideas on pharmaceutical
          manufacturing, local small-scale manufacturing, academia, veterinary pharmacy practice and more.
        </li>
        <li>
          <strong>Professional dialogue</strong> — discuss developments affecting Dispensers and Pharmacy Assistants, including
          regulation, private practice, employment, professional development and the evolving health-care environment.
        </li>
        <li>
          <strong>Planning for 2026/2027</strong> — an opportunity for Dispensers and Pharmacy Assistants to get back to the
          drawing board and plan again.
        </li>
        <li>
          <strong>Accountability and reporting</strong> — reflect on the Association&rsquo;s activities, achievements, challenges and
          priorities during the year.
        </li>
        <li>
          <strong>Networking and collaboration</strong> — meet professionals from different regions and practice settings, exchange
          experiences and build professional networks.
        </li>
        <li>
          <strong>Recognition</strong> — celebrating members whose contributions have supported the growth of the profession and
          the Association.
        </li>
      </ul>
      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        Most importantly, the AGM is an opportunity for members to participate in shaping the future of their Association.
        The profession is changing. The AGM is where we come together to discuss how we respond to that change.
      </p>

      <!-- Section: CPD -->
      <p class="text-main" style="margin:28px 0 12px;font:bold 18px/1.3 Georgia,'Times New Roman',serif;color:#1f2933;border-bottom:2px solid #e0a100;padding-bottom:6px;">Continuing Professional Development (CPD) is now mandatory</p>

      <img src="https://ppau.info/images/newsletter-cpd.jpeg" width="600" alt="Continuing Professional Development" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:6px;margin:0 0 16px;">

      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        As Uganda moves towards CPD-based renewal of Annual Practising Licences, Continuing Professional Development remains a
        major priority for PPAU. Professional registration is not the end of professional development — the medicines
        environment continues to change, and practitioners must continually update their knowledge and skills.
      </p>
      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        PPAU is committed to supporting accessible and relevant CPD opportunities for Dispensers and Pharmacy Assistants, and
        continues to explore different approaches to CPD delivery, including:
      </p>
      <ul class="text-main" style="font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        <li>Online CPD activities</li>
        <li>Blended learning</li>
        <li>Regional CPD programmes</li>
        <li>Self-assessment</li>
        <li>Professional updates and technical sessions</li>
      </ul>
      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        PPAU&rsquo;s approach is that CPD should be <strong>accessible, relevant, practical and responsive</strong> to the realities of
        practice. Professional development should not be confined to Kampala. Members across Uganda should have opportunities
        to participate.
      </p>
      <p class="text-main" style="margin:0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        As CPD-based licensing approaches implementation, members are encouraged to take their professional development seriously
        and to begin planning for their CPD requirements rather than waiting until the licence-renewal period. CPD is not simply
        a licensing requirement. It is an investment in professional competence and patient safety.
      </p>

      <!-- Section: AMR -->
      <p class="text-main" style="margin:28px 0 12px;font:bold 18px/1.3 Georgia,'Times New Roman',serif;color:#1f2933;border-bottom:2px solid #e0a100;padding-bottom:6px;">November is the AMR month — What this means for PPAU</p>

      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        Antimicrobial Resistance (AMR) is a growing global public-health burden that threatens the effectiveness of medicines
        used to prevent and treat infections.
      </p>
      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        As PPAU, we recognise that Dispenser and Pharmacy Assistant practice has an important role to play in addressing AMR.
        As frontline health professionals, our members interact with patients every day and are therefore strategically
        positioned to promote responsible antimicrobial use and contribute to public awareness.
      </p>
      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        Throughout November, PPAU joins other health-sector stakeholders in creating awareness among the public on AMR, its
        causes, consequences and how it can be prevented. As part of this campaign, PPAU will communicate key strategies that
        we shall use in creating awareness.
      </p>
      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        <strong>AMR is everyone&rsquo;s responsibility.</strong> This November, PPAU calls upon all Dispensers and Pharmacy Assistants to
        join the campaign, educate their patients and communities, and make every professional interaction an opportunity to
        promote responsible antimicrobial use.
      </p>
      <p class="text-main" style="margin:0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        Watch this space for PPAU&rsquo;s AMR awareness messages and key strategies throughout the month.
      </p>

      <!-- Section: Looking ahead -->
      <p class="text-main" style="margin:28px 0 12px;font:bold 18px/1.3 Georgia,'Times New Roman',serif;color:#1f2933;border-bottom:2px solid #e0a100;padding-bottom:6px;">Looking ahead</p>

      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        The coming months present both opportunities and challenges for the pharmacy and allied health professions. From private
        practice standards to the PPAU AGM, from CPD and professional development to the economic pressures created by currency
        depreciation, the environment in which health professionals operate continues to evolve.
      </p>
      <p class="text-main" style="margin:0 0 12px;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        PPAU remains committed to ensuring that its members are not merely observers of these changes, but active participants
        in shaping the future of their profession.
      </p>
      <p class="text-main" style="margin:0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        The message is clear:
      </p>
      <ul class="text-main" style="font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        <li>Professional growth requires preparedness.</li>
        <li>Private practice requires standards.</li>
        <li>Competence requires continuous learning.</li>
        <li>A stronger profession requires unity.</li>
      </ul>

      <!-- Closing call to action -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;">
        <tr><td bgcolor="#eaf4ef" style="background-color:#eaf4ef;border-radius:6px;padding:20px 22px;" align="center">
          <p style="margin:0 0 6px;font:bold 17px/1.3 Georgia,'Times New Roman',serif;color:#0b4d38;">Prepare for the AGM and plan your CPD</p>
          <p style="margin:0 0 14px;font:14px/1.5 Arial,Helvetica,sans-serif;color:#33403a;">Log in to the member portal for updates on the 2026 AGM, CPD activities, and more.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn"><tr>
            <td bgcolor="#0b6e4f" style="background-color:#0b6e4f;border-radius:5px;">
              <a href="https://ppau.info/member/login" style="display:inline-block;padding:12px 24px;font:bold 15px/1 Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;">Member login</a>
            </td>
          </tr></table>
        </td></tr>
      </table>

      <p class="text-main" style="margin:28px 0 0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#1f2933;">
        Warm regards,<br><strong>The PPAU Secretariat</strong>
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td bgcolor="#1f2933" class="pad" style="background-color:#1f2933;padding:24px 32px;border-radius:0 0 8px 8px;" align="center">
      <p style="margin:0 0 8px;font:bold 14px/1.4 Arial,Helvetica,sans-serif;color:#ffffff;">PPAU</p>
      <p style="margin:0 0 10px;font:13px/1.6 Arial,Helvetica,sans-serif;color:#c3cbc7;">
        Kampala, Uganda<br>
        <a href="mailto:info@ppau.info" style="color:#9fe0c3;">info@ppau.info</a> &nbsp;|&nbsp; <a href="https://ppau.info" style="color:#9fe0c3;">ppau.info</a>
      </p>
      <p style="margin:0;font:12px/1.6 Arial,Helvetica,sans-serif;color:#9aa5a0;">
        You are receiving this email because you are a registered PPAU member.<br>
        <a href="{{unsubscribe_url}}" style="color:#9fe0c3;">Unsubscribe</a> from member newsletters.
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

export function buildNewsletterHtml(opts: {
  issueNumber?: string;
  issueDate?: string;
  viewOnlineUrl?: string;
  unsubscribeUrl?: string;
}) {
  return NEWSLETTER_TEMPLATE.replaceAll("{{NEWSLETTER_BANNER_URL}}", NEWSLETTER_BANNER_URL)
    .replaceAll("{{issue_number}}", opts.issueNumber?.trim() || "")
    .replaceAll("{{issue_date}}", opts.issueDate?.trim() || "")
    .replaceAll("{{view_online_url}}", opts.viewOnlineUrl?.trim() || "https://ppau.info")
    .replaceAll("{{unsubscribe_url}}", opts.unsubscribeUrl?.trim() || "https://ppau.info/contact");
}

export function isFullHtmlDocument(html: string) {
  return /^\s*(<!doctype html|<\s*html)/i.test(html);
}
