import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/membership-form")({
  head: () =>
    pageHead({
      title: "Membership Application",
      description:
        "Apply online for PPAU professional or student membership. Register as a dispenser, pharmacy assistant, or pharmacy student in Uganda.",
      path: "/membership-form",
      keywords:
        "PPAU application, join PPAU online, professional membership form, student membership form Uganda",
    }),
  component: MembershipFormLayout,
});

function MembershipFormLayout() {
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Membership Application"
        subtitle="Register as a professional or student member of PPAU."
      />
      <section className="section-padding bg-background pb-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <Outlet />
        </div>
      </section>
    </>
  );
}
