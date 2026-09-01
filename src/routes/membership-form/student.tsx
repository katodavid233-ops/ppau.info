import { useState } from "react";
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
  studentApplicationSchema,
  type StudentApplicationValues,
  REGIONS,
  GENDERS,
  INSTITUTIONS,
  STUDENT_INTERESTS,
} from "@/lib/membership/schemas";
import { DEFAULT_STUDENT_CONFIG } from "@/lib/membership/form-config-defaults";
import {
  fieldsForStep,
  isFieldEnabled,
} from "@/lib/membership/form-config-utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/membership-form/student")({
  head: () =>
    pageHead({
      title: "Student Membership Application",
      description:
        "Apply for free PPAU student membership if you are enrolled in a certificate or diploma in pharmacy programme in Uganda.",
      path: "/membership-form/student",
    }),
  component: StudentFormPage,
});

const PROGRAMME_OPTIONS = ["Certificate in Pharmacy", "Diploma in Pharmacy"] as const;
const YEAR_OPTIONS = ["Year 1", "Year 2", "Year 3"] as const;
const SEMESTER_OPTIONS = ["Semester I", "Semester II"] as const;

function StudentFormPage() {
  const navigate = useNavigate();
  const { data: formConfig } = useQuery({
    queryKey: ["public-form-config", "student"],
    queryFn: () => fetchPublicFormConfig("student"),
  });

  const fields = formConfig?.fields_config ?? DEFAULT_STUDENT_CONFIG.fields_config;
  const steps = formConfig?.steps_config ?? DEFAULT_STUDENT_CONFIG.steps_config;
  const documents = formConfig?.documents_config ?? DEFAULT_STUDENT_CONFIG.documents_config;

  const [step, setStep] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(
    () => sessionStorage.getItem("ppau_student_app_id"),
  );
  const [isOtherInstitution, setIsOtherInstitution] = useState(false);

  const currentStep = steps[step] ?? steps[0];
  const show = (key: string) => isFieldEnabled(fields, key);

  const form = useForm<StudentApplicationValues>({
    resolver: zodResolver(studentApplicationSchema),
    defaultValues: {
      nationality: DEFAULT_COUNTRY,
      phone: "",
      student_interests: [],
      declaration: undefined,
    },
  });

  const nationality = form.watch("nationality");

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
    const { application_id } = await createApplication("student", email, full_name);
    sessionStorage.setItem("ppau_student_app_id", application_id);
    setApplicationId(application_id);
    return application_id;
  }

  async function onSubmit(values: StudentApplicationValues) {
    const appId = await ensureApplication();
    if (!appId) return;
    const { declaration: _, ...payload } = values;
    try {
      const result = await submitApplication(appId, {
        ...payload,
        membership_type: "student",
        student_interests: values.student_interests,
        payment_status: "not_required",
      });
      sessionStorage.removeItem("ppau_student_app_id");
      navigate({
        to: "/membership-form/success",
        search: {
          application_id: appId,
          type: "student",
          membership_number: result.membership_number,
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    }
  }

  async function nextStep() {
    let keys = fieldsForStep(fields, currentStep) as (keyof StudentApplicationValues)[];
    if (currentStep === "Academic" && !form.getValues("semester")) {
      keys = keys.filter((k) => k !== "semester");
    }
    if (keys.length > 0) {
      const valid = await form.trigger(keys);
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
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {currentStep === "Personal" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Section A: Personal Information</h3>
              {show("full_name") && (
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="full_name" fallback="Full Name" />
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
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
                            <RadioGroupItem value={g} id={`s-${g}`} />
                            <Label htmlFor={`s-${g}`}>{g}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("date_of_birth") && (
                <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="date_of_birth" fallback="Date of Birth" />
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
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
              {show("id_number") && (
                <FormField control={form.control} name="id_number" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="id_number" fallback="Student ID Number" />
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("physical_address") && (
                <FormField control={form.control} name="physical_address" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="physical_address" fallback="Physical Address" />
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
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
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
          )}

          {currentStep === "Academic" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Section B: Academic Information</h3>
              {show("institution_name") && (
                <FormField control={form.control} name="institution_name" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="institution_name" fallback="Institution" />
                    <Select
                      onValueChange={(v) => {
                        if (v === "Other") {
                          setIsOtherInstitution(true);
                          field.onChange("");
                        } else {
                          setIsOtherInstitution(false);
                          field.onChange(v);
                        }
                      }}
                      value={isOtherInstitution ? "Other" : field.value}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select institution" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {INSTITUTIONS.map((inst) => (
                          <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isOtherInstitution && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter your institution name"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("programme") && (
                <FormField control={form.control} name="programme" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="programme" fallback="Programme" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PROGRAMME_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("date_of_admission") && (
                <FormField control={form.control} name="date_of_admission" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="date_of_admission" fallback="Date of admission" />
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("year_of_study") && (
                <FormField control={form.control} name="year_of_study" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="year_of_study" fallback="Year of Study" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {YEAR_OPTIONS.map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("semester") && (
                <FormField control={form.control} name="semester" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="semester" fallback="Semester" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {SEMESTER_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("registration_number") && (
                <FormField control={form.control} name="registration_number" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="registration_number" fallback="Registration Number" />
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("expected_completion_year") && (
                <FormField control={form.control} name="expected_completion_year" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel
                      fields={fields}
                      name="expected_completion_year"
                      fallback="Expected Year of Completion"
                    />
                    <FormControl><Input type="number" min={2024} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("admission_criteria") && (
                <FormField control={form.control} name="admission_criteria" render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="admission_criteria" fallback="Admission criteria" />
                    <FormControl><Input placeholder="e.g. Direct (A level)" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {show("student_interests") && (
                <FormField control={form.control} name="student_interests" render={() => (
                  <FormItem>
                    <FormFieldLabel fields={fields} name="student_interests" fallback="Areas of Interest" />
                    <div className="grid gap-2 sm:grid-cols-2">
                      {STUDENT_INTERESTS.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="student_interests"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(c) => {
                                    const next = c
                                      ? [...(field.value ?? []), item]
                                      : (field.value ?? []).filter((v) => v !== item);
                                    field.onChange(next);
                                  }}
                                />
                              </FormControl>
                              <Label className="font-normal text-sm">{item}</Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
          )}

          {currentStep === "Documents" && applicationId && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Attachments</h3>
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
            <p className="text-sm text-muted-foreground">
              Complete personal details first, then return to upload documents.
            </p>
          )}

          {currentStep === "Declaration" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Section D: Declaration</h3>
              <p className="text-sm text-muted-foreground">
                I apply for student membership in PPAU and confirm the information above is true and correct.
              </p>
              {show("declaration") && (
                <FormField control={form.control} name="declaration" render={({ field }) => (
                  <FormItem className="flex items-start gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(c) => field.onChange(c ? true : undefined)}
                      />
                    </FormControl>
                    <FormFieldLabel fields={fields} name="declaration" fallback="I accept the declaration" className="font-normal" />
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
              {step === steps.length - 1 ? "Submit application" : "Next"}
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
