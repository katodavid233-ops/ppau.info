export type FormDocumentConfig = {
  type: string;
  label: string;
  required: boolean;
};

export type FormFieldConfig = {
  key: string;
  label: string;
  helpText?: string;
  required: boolean;
  enabled: boolean;
  step: string;
};

export type MembershipFormConfig = {
  id?: string;
  membership_type: "professional" | "student";
  title: string;
  subtitle: string | null;
  intro_html: string | null;
  fee_ugx: number | null;
  fee_label: string | null;
  fields_config: FormFieldConfig[];
  documents_config: FormDocumentConfig[];
  steps_config: string[];
  is_published: boolean;
};

export const PROFESSIONAL_FIELD_DEFAULTS: FormFieldConfig[] = [
  { key: "full_name", label: "Full Name", required: true, enabled: true, step: "Personal" },
  { key: "gender", label: "Gender", required: true, enabled: true, step: "Personal" },
  { key: "date_of_birth", label: "Date of Birth", required: true, enabled: true, step: "Personal" },
  { key: "nationality", label: "Nationality", required: true, enabled: true, step: "Personal" },
  { key: "phone", label: "Telephone", required: true, enabled: true, step: "Personal" },
  { key: "email", label: "Email", required: true, enabled: true, step: "Personal" },
  {
    key: "physical_address",
    label: "Physical Address / Residence",
    required: true,
    enabled: true,
    step: "Personal",
  },
  { key: "region", label: "Region", required: true, enabled: true, step: "Personal" },
  {
    key: "professional_qualification",
    label: "Cadre",
    required: true,
    enabled: true,
    step: "Professional",
    helpText: "Dispenser, Pharmacy Assistant, or Other (specify below)",
  },
  {
    key: "additional_qualification",
    label: "Additional qualification (specify)",
    required: false,
    enabled: true,
    step: "Professional",
    helpText: "Required when cadre is Other",
  },
  {
    key: "ahpc_registration_number",
    label: "AHPC Registration Number",
    required: true,
    enabled: true,
    step: "Professional",
  },
  {
    key: "practice_area",
    label: "Current practice area",
    required: true,
    enabled: true,
    step: "Professional",
  },
  {
    key: "sector",
    label: "Sector",
    required: true,
    enabled: true,
    step: "Professional",
    helpText: "Private sector or Public sector",
  },
  {
    key: "government_facility_name",
    label: "Name of government facility",
    required: false,
    enabled: true,
    step: "Professional",
    helpText: "Shown when sector is Public",
  },
  { key: "work_address", label: "Work Address", required: true, enabled: true, step: "Professional" },
  {
    key: "years_experience",
    label: "Years of Professional Experience",
    required: true,
    enabled: true,
    step: "Professional",
  },
  {
    key: "willing_to_participate",
    label: "Would you be willing to participate in PPAU activities and committees?",
    required: true,
    enabled: true,
    step: "Other",
  },
  {
    key: "interests",
    label: "Area(s) of Interest in the Association (if willing to participate)",
    required: false,
    enabled: true,
    step: "Other",
    helpText: "Select at least one when you answer Yes above",
  },
  {
    key: "participation_area",
    label: "If yes, specify area of interest",
    required: false,
    enabled: true,
    step: "Other",
    helpText: "Optional details beyond the checkboxes above",
  },
  {
    key: "declaration",
    label: "I accept the declaration above",
    required: true,
    enabled: true,
    step: "Declaration",
  },
];

export const STUDENT_FIELD_DEFAULTS: FormFieldConfig[] = [
  { key: "full_name", label: "Full Name", required: true, enabled: true, step: "Personal" },
  { key: "gender", label: "Gender", required: true, enabled: true, step: "Personal" },
  { key: "date_of_birth", label: "Date of Birth", required: true, enabled: true, step: "Personal" },
  { key: "nationality", label: "Nationality", required: true, enabled: true, step: "Personal" },
  { key: "id_number", label: "Student ID Number", required: true, enabled: true, step: "Personal" },
  { key: "phone", label: "Telephone", required: true, enabled: true, step: "Personal" },
  { key: "email", label: "Email", required: true, enabled: true, step: "Personal" },
  {
    key: "physical_address",
    label: "Physical Address / Residence",
    required: true,
    enabled: true,
    step: "Personal",
  },
  { key: "region", label: "Region", required: true, enabled: true, step: "Personal" },
  { key: "institution_name", label: "Institution", required: true, enabled: true, step: "Academic" },
  { key: "programme", label: "Programme", required: true, enabled: true, step: "Academic" },
  {
    key: "date_of_admission",
    label: "Date of admission",
    required: true,
    enabled: true,
    step: "Academic",
  },
  { key: "year_of_study", label: "Year of Study", required: true, enabled: true, step: "Academic" },
  {
    key: "semester",
    label: "Semester",
    required: false,
    enabled: true,
    step: "Academic",
    helpText: "Optional",
  },
  {
    key: "registration_number",
    label: "Registration Number",
    required: true,
    enabled: true,
    step: "Academic",
  },
  {
    key: "expected_completion_year",
    label: "Expected Year of Completion",
    required: true,
    enabled: true,
    step: "Academic",
  },
  {
    key: "admission_criteria",
    label: "Admission criteria",
    required: true,
    enabled: true,
    step: "Academic",
    helpText: "e.g. Direct (A level)",
  },
  { key: "student_interests", label: "Areas of Interest", required: true, enabled: true, step: "Academic" },
  {
    key: "declaration",
    label: "I accept the declaration",
    required: true,
    enabled: true,
    step: "Declaration",
  },
];

export const DEFAULT_PROFESSIONAL_CONFIG: MembershipFormConfig = {
  membership_type: "professional",
  title: "Professional Membership Application",
  subtitle: "Annual subscription — UGX 50,000",
  intro_html: "<p>Complete all sections accurately.</p>",
  fee_ugx: 50000,
  fee_label: "UGX 50,000 per annum",
  steps_config: ["Personal", "Professional", "Other", "Documents", "Declaration"],
  documents_config: [
    { type: "photo", label: "Recent photograph", required: true },
    { type: "ahpc_certificate", label: "Certificate of registration", required: true },
    {
      type: "payment_proof",
      label: "Proof of payment (if already paid manually)",
      required: false,
    },
  ],
  fields_config: PROFESSIONAL_FIELD_DEFAULTS,
  is_published: true,
};

export const DEFAULT_STUDENT_CONFIG: MembershipFormConfig = {
  membership_type: "student",
  title: "Student Membership Application",
  subtitle: "Free student membership",
  intro_html: "<p>For pharmacy students.</p>",
  fee_ugx: 0,
  fee_label: "Free",
  steps_config: ["Personal", "Academic", "Documents", "Declaration"],
  documents_config: [
    { type: "student_id", label: "Student ID", required: true },
    { type: "photo", label: "Passport photograph", required: true },
    { type: "admission_letter", label: "Admission letter", required: true },
  ],
  fields_config: STUDENT_FIELD_DEFAULTS,
  is_published: true,
};
