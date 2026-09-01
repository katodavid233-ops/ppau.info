import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicFormConfig } from "@/lib/admin/forms";
import { IntroNotice } from "@/components/membership/IntroNotice";
import { FormFieldLabel } from "@/components/membership/FormFieldLabel";
import { CountrySelect } from "@/components/membership/CountrySelect";
import { PhoneInput } from "@/components/membership/PhoneInput";
import { DEFAULT_COUNTRY } from "@/lib/data/countries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DocumentUpload } from "@/components/membership/DocumentUpload";
import { createApplication, submitApplication } from "@/lib/membership/api";
import {
  professionalApplicationSchema,
  type ProfessionalApplicationValues,
  REGIONS,
  GENDERS,
  PROFESSIONAL_CADRES,
  PRACTICE_AREAS,
  INTEREST_AREAS,
} from "@/lib/membership/schemas";
import { DEFAULT_PROFESSIONAL_CONFIG } from "@/lib/membership/form-config-defaults";
import {
  fieldsForStep,
  isFieldEnabled,
} from "@/lib/membership/form-config-utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/membership-form/professional")({
  head: () =>
    pageHead({
      title: "Professional Membership Application",
      description:
        "Apply for PPAU professional membership as a dispenser, pharmacy assistant, or allied pharmacy professional in Uganda.",
      path: "/membership-form/professional",
    }),
  component: ProfessionalFormPage,
});

function ProfessionalFormPage() {
  const navigate = useNavigate();
  const { data: formConfig } = useQuery({
    queryKey: ["public-form-config", "professional"],
    queryFn: () => fetchPublicFormConfig("professional"),
  });

  const fields = formConfig?.fields_config ?? DEFAULT_PROFESSIONAL_CONFIG.fields_config;
  const steps = formConfig?.steps_config ?? DEFAULT_PROFESSIONAL_CONFIG.steps_config;
  const documents = formConfig?.documents_config ?? DEFAULT_PROFESSIONAL_CONFIG.documents_config;

  const [step, setStep] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(
    () => sessionStorage.getItem("ppau_app_id"),
  );

  const currentStep = steps[step] ?? steps[0];
  const show = (key: string) => isFieldEnabled(fields, key);

  const form = useForm<ProfessionalApplicationValues>({
    resolver: zodResolver(professionalApplicationSchema),
    defaultValues: {
      nationality: DEFAULT_COUNTRY,
      phone: "",
      interests: [],
      willing_to_participate: false,
      sector: "private",
      declaration: undefined,
    },
  });

  const sector = form.watch("sector");
  const willing = form.watch("willing_to_participate");
  const cadre = form.watch("professional_qualification");
  const nationality = form.watch("nationality");

  const validationFields = useMemo(() => {
    let keys = fieldsForStep(fields, currentStep) as (keyof ProfessionalApplicationValues)[];
    if (currentStep === "Professional") {
      if (sector !== "public") {
        keys = keys.filter((k) => k !== "government_facility_name");
      }
      if (cadre !== "Other") {
        keys = keys.filter((k) => k !== "additional_qualification");
      }
    }
    if (currentStep === "Other" && !willing) {
      keys = keys.filter((k) => k !== "participation_area" && k !== "interests");
    }
    return keys;
  }, [fields, currentStep, sector, willing, cadre]);

  async function ensureApplication() {
    if (applicationId) return applicationId;
    const { full_name, email } = form.getValues();
    if (!full_name || !email) {
      toast.error("Enter full name and email first");
      return null;
    }
    if (!isSupabaseConfigured) {
      toast.error("Membership portal is not configured yet");
      return null;
    }
    const { application_id } = await createApplication("professional", email, full_name);
    sessionStorage.setItem("ppau_app_id", application_id);
    setApplicationId(application_id);
    return application_id;
  }

  async function onSubmit(values: ProfessionalApplicationValues) {
    const appId = await ensureApplication();
    if (!appId) return;

    const { declaration: _, ...payload } = values;
    try {
      await submitApplication(appId, {
        ...payload,
        membership_type: "professional",
        interests: values.interests,
        willing_to_participate: values.willing_to_participate,
        participation_area: values.participation_area ?? null,
        government_facility_name:
          values.sector === "public" ? values.government_facility_name : null,
      });
      sessionStorage.removeItem("ppau_app_id");
      navigate({
        to: "/membership-form/payment",
        search: { application_id: appId },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    }
  }

  async function nextStep() {
    if (validationFields.length > 0) {
      const valid = await form.trigger(validationFields);
      if (!valid) return;
    }
    if (currentStep === "Personal") {
      try {
        const appId = await ensureApplication();
        if (!appId) return;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not start application");
        return;
      }
    }
    if (step < steps.length - 1) setStep(step + 1);
    else form.handleSubmit(onSubmit)();
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
      {formConfig?.title && (
        <h2 className="text-xl font-bold text-foreground mb-1">{formConfig.title}</h2>
      )}
      {formConfig?.subtitle && (
        <p className="text-sm text-muted-foreground mb-4">{formConfig.subtitle}</p>
      )}
      {formConfig?.intro_html && <IntroNotice html={formConfig.intro_html} />}
      <div className="flex gap-2 mb-6 flex-wrap">
        {steps.map((s, i) => (
          <span
            key={s}
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              i === step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}. {s}
          </span>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === "Personal" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Section A: Personal Information</h3>
              {show("full_name") && (
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="full_name" fallback="Full Name" />
                    <FormControl><Input {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("gender") && (
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="gender" fallback="Gender" />
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                        {GENDERS.map((g) => (
                          <div key={g} className="flex items-center gap-2">
                            <RadioGroupItem value={g} id={g} /><Label htmlFor={g}>{g}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("date_of_birth") && (
                <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="date_of_birth" fallback="Date of Birth" />
                    <FormControl><Input type="date" {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("nationality") && (
                <FormField control={form.control} name="nationality" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="nationality" fallback="Nationality" />
                    <FormControl>
                      <CountrySelect value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("phone") && (
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="phone" fallback="Telephone" />
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        nationality={nationality}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("email") && (
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="email" fallback="Email" />
                    <FormControl><Input type="email" {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("physical_address") && (
                <FormField control={form.control} name="physical_address" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="physical_address" fallback="Physical Address / Residence" />
                    <FormControl><Textarea {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("region") && (
                <FormField control={form.control} name="region" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="region" fallback="Region" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger></FormControl>
                      <SelectContent>{REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
          )}

          {currentStep === "Professional" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Section B: Professional Information</h3>
              {show("professional_qualification") && (
                <FormField control={form.control} name="professional_qualification" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="professional_qualification" fallback="Cadre" />
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col gap-2"
                      >
                        {PROFESSIONAL_CADRES.map((c) => (
                          <div key={c} className="flex items-center gap-2">
                            <RadioGroupItem value={c} id={`cadre-${c}`} />
                            <Label htmlFor={`cadre-${c}`} className="font-normal">
                              {c}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("additional_qualification") && (
                <FormField control={form.control} name="additional_qualification" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel
                      fields={fields}
                      name="additional_qualification"
                      fallback="Additional qualification (specify)"
                    />
                    <FormControl><Input {...field} placeholder={cadre === "Other" ? "Specify cadre or qualification" : ""} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("ahpc_registration_number") && (
                <FormField control={form.control} name="ahpc_registration_number" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="ahpc_registration_number" fallback="AHPC Registration Number" />
                    <FormControl><Input {...field} required /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("practice_area") && (
                <FormField control={form.control} name="practice_area" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="practice_area" fallback="Current practice area" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>{PRACTICE_AREAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("sector") && (
                <FormField control={form.control} name="sector" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="sector" fallback="Sector" />
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                        <div className="flex items-center gap-2"><RadioGroupItem value="private" id="private" /><Label htmlFor="private" className="font-normal">Private sector</Label></div>
                        <div className="flex items-center gap-2"><RadioGroupItem value="public" id="public" /><Label htmlFor="public" className="font-normal">Public sector</Label></div>
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("government_facility_name") && sector === "public" && (
                <FormField control={form.control} name="government_facility_name" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="government_facility_name" fallback="Name of government facility" />
                    <FormControl><Input {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("work_address") && (
                <FormField control={form.control} name="work_address" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="work_address" fallback="Work Address" />
                    <FormControl><Textarea {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
              {show("years_experience") && (
                <FormField control={form.control} name="years_experience" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="years_experience" fallback="Years of Professional Experience" />
                    <FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
          )}

          {currentStep === "Other" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Section C: Other Details</h3>
              {show("willing_to_participate") && (
                <FormField control={form.control} name="willing_to_participate" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel
                      fields={fields}
                      name="willing_to_participate"
                      fallback="Would you be willing to participate in PPAU activities and committees?"
                    />
                    <FormControl>
                      <RadioGroup
                        onValueChange={(v) => field.onChange(v === "yes")}
                        value={field.value === true ? "yes" : field.value === false ? "no" : ""}
                        className="flex gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="willing-yes" />
                          <Label htmlFor="willing-yes" className="font-normal">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="willing-no" />
                          <Label htmlFor="willing-no" className="font-normal">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("interests") && willing && (
                <FormField control={form.control} name="interests" render={() => (
                  <FormItem>
                    <FormFieldLabel
                      fields={fields}
                      name="interests"
                      fallback="Area(s) of Interest in the Association (if willing to participate)"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      {INTEREST_AREAS.map((item) => (
                        <FormField key={item} control={form.control} name="interests" render={({ field }) => {
                          const checked = field.value?.includes(item);
                          return (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={checked} onCheckedChange={(c) => {
                                  const next = c ? [...(field.value ?? []), item] : (field.value ?? []).filter((v) => v !== item);
                                  field.onChange(next);
                                }} />
                              </FormControl>
                              <Label className="font-normal text-sm">{item}</Label>
                            </FormItem>
                          );
                        }} />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("participation_area") && willing && (
                <FormField control={form.control} name="participation_area" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="participation_area" fallback="If yes, specify area of interest" />
                    <FormControl><Input {...field} placeholder="Optional details" /></FormControl><FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
          )}

          {currentStep === "Documents" && applicationId && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Upload Documents</h3>
              {documents.map((doc) => (
                <DocumentUpload
                  key={doc.type}
                  applicationId={applicationId}
                  documentType={doc.type}
                  label={doc.label}
                  required={doc.required}
                />
              ))}
            </div>
          )}

          {currentStep === "Documents" && !applicationId && (
            <p className="text-sm text-muted-foreground">Complete personal details first, then return to upload documents.</p>
          )}

          {currentStep === "Declaration" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Section D: Declaration</h3>
              <p className="text-sm text-muted-foreground">
                I hereby declare that the information provided is true and correct. I agree to abide by the
                Constitution, regulations, ethical standards, and resolutions of PPAU.
              </p>
              {show("declaration") && (
                <FormField control={form.control} name="declaration" render={({ field }) => (
                  <FormItem className="flex items-start gap-2">
                    <FormControl>
                      <Checkbox checked={field.value === true} onCheckedChange={(c) => field.onChange(c ? true : undefined)} />
                    </FormControl>
                    <FormFieldLabel fields={fields} name="declaration" fallback="I accept the declaration above" className="font-normal" />
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            <Button type="button" onClick={nextStep}>
              {step === steps.length - 1 ? "Submit & continue to payment" : "Next"}
            </Button>
          </div>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/membership-form" className="text-primary hover:underline">
          ← Back to membership options
        </Link>
      </p>
    </div>
  );
}
