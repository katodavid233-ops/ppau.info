import { z } from "zod";

export const REGIONS = ["Northern", "Eastern", "Western", "Central"] as const;
export const GENDERS = ["Male", "Female"] as const;

export const PROFESSIONAL_CADRES = [
  "Dispenser",
  "Pharmacy Assistant",
  "Other",
] as const;

/** @deprecated use PROFESSIONAL_CADRES */
export const PROFESSIONAL_QUALIFICATIONS = PROFESSIONAL_CADRES;

export const PRACTICE_AREAS = [
  "Hospital pharmacy",
  "Hospital Dispensary (AHPC licensed)",
  "Community pharmacy",
  "Regulatory agency",
  "Academia",
  "Private Drug Dispensary",
  "Class C licensed seller outlet",
  "NGO",
  "Research",
  "Pharmaceutical industry",
  "Supply chain",
  "Public service",
] as const;

export const PARTICIPATION_AREAS = [
  "Professional advocacy",
  "Public health campaigns",
  "Continuing Professional Development (CPD)",
  "Research & Innovation",
  "Legal & policy",
] as const;

export const INTEREST_AREAS = [
  "Professional Advocacy",
  "Public Health Campaigns",
  "Continuing Professional Development (CPD)",
  "Research and Innovation",
  "Legal and policy",
] as const;

export const INSTITUTIONS = [
  "Arua Institute of Health Sciences",
  "Bugembe Institute of Health Sciences",
  "Buloba College of Health Sciences",
  "Central School of Allied Health Sciences-Wakiso",
  "Elgon International Health Institute-Mable",
  "Fins Medical University Fortportal",
  "Fortportal College of Health Sciences",
  "Gulu College of Health Sciences",
  "Indian Institute of Allied Health Sciences",
  "International Paramedical Institute -Maya",
  "Ishaka Adventist School of Allied Health Sciences",
  "Jerusalem Institute of Health Sciences",
  "Kampala Institute of Health Professionals",
  "Kampala Institute of Science and Technology",
  "Kampala School of Health Sciences",
  "Kampala School of Paramedicals",
  "Karoli Lwanga Institute of Health Sciences-Nyakibale",
  "Kawempe Community School of Health Sciences",
  "Koboko Institute of Health Sciences",
  "Kumi Institute of Allied Health Sciences",
  "Lira Institute of Health and Management Sciences",
  "Lubega School of Health Professionals",
  "Lugazi Institute of Medical Education and Management",
  "Mbale College of Health Sciences",
  "Mbarara Institute of Health Sciences and Management",
  "Metropolitan International University-Mbarara",
  "Soroti Pharmaceutical Training College",
  "St. Elizabeth Institute of Health Professionals-Mukono",
  "St. Francis School of Health Sciences",
  "St. Regina College of Health Professionals",
  "Tororo School of Health Sciences",
  "Tropical Institute of Allied Health Sciences-Namugongo",
  "UIAHMS-Mulago School of Pharmacy",
  "Vine Paramedical School",
  "Other",
] as const;

export const STUDENT_INTERESTS = [
  "Community Pharmacy",
  "Hospital Pharmacy",
  "Industrial Pharmacy",
  "Regulatory Affairs (NDA, NMS, AHPC etc)",
  "Pharmaceutical Supply Chain",
  "Research and Academia",
  "Other",
] as const;

const personalSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  gender: z.enum(GENDERS),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  id_number: z.string().min(1, "ID number is required"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number with country code")
    .refine(
      (v) => /^\+[1-9]\d{8,14}$/.test(v.replace(/\s/g, "")),
      "Include country code (e.g. +256701234567)",
    ),
  email: z.string().email("Valid email required"),
  physical_address: z.string().min(3, "Address is required"),
  region: z.enum(REGIONS),
});

export const professionalApplicationSchema = personalSchema
  .omit({ id_number: true })
  .extend({
    professional_qualification: z.string().min(1, "Select your cadre"),
    additional_qualification: z.string().optional(),
    ahpc_registration_number: z.string().min(1, "AHPC registration number is required"),
    practice_area: z.string().min(1, "Select your current practice area"),
    sector: z.enum(["private", "public"]),
    government_facility_name: z.string().optional(),
    work_address: z.string().min(3),
    years_experience: z.coerce.number().min(0),
    interests: z.array(z.string()).default([]),
    willing_to_participate: z.boolean(),
    participation_area: z.string().optional(),
    declaration: z.literal(true, {
      errorMap: () => ({ message: "You must accept the declaration" }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.professional_qualification === "Other" && !data.additional_qualification?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify your cadre when Other is selected",
        path: ["additional_qualification"],
      });
    }
    if (data.willing_to_participate && data.interests.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one area of interest",
        path: ["interests"],
      });
    }
  });

export const studentApplicationSchema = personalSchema.extend({
  institution_name: z.string().min(2),
  programme: z.string().min(1),
  date_of_admission: z.string().min(1),
  year_of_study: z.string().min(1),
  semester: z.string().optional(),
  registration_number: z.string().min(1),
  expected_completion_year: z.coerce.number().min(2024),
  admission_criteria: z.string().min(1),
  student_interests: z.array(z.string()).min(1),
  declaration: z.literal(true, {
    errorMap: () => ({ message: "You must accept the declaration" }),
  }),
});

export type ProfessionalApplicationValues = z.infer<typeof professionalApplicationSchema>;
export type StudentApplicationValues = z.infer<typeof studentApplicationSchema>;
