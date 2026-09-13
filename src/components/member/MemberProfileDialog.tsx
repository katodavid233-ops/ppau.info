import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { PhoneInput } from "@/components/membership/PhoneInput";
import { CountrySelect } from "@/components/membership/CountrySelect";
import { REGIONS, GENDERS, PRACTICE_AREAS } from "@/lib/membership/schemas";
import { updateMemberProfile } from "@/lib/membership/api";

const SECTORS = ["private", "public"] as const;

const personalSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  physical_address: z.string().optional(),
  region: z.string().optional(),
  nationality: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
});

const professionalSchema = personalSchema.extend({
  ahpc_registration_number: z.string().optional(),
  practice_area: z.string().optional(),
  sector: z.enum(["private", "public"]).optional(),
  government_facility_name: z.string().optional(),
  work_address: z.string().optional(),
});

type ProfileValues = z.infer<typeof professionalSchema>;

type Props = {
  member: Record<string, unknown>;
  application?: Record<string, unknown> | null;
  accessToken: string;
};

export function MemberProfileDialog({ member, application, accessToken }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const isProfessional = member.membership_type === "professional";
  const schema = isProfessional ? professionalSchema : personalSchema;

  const app = application ?? {};
  const defaults: ProfileValues = {
    full_name: String(member.full_name ?? app.full_name ?? ""),
    email: String(member.email ?? app.email ?? ""),
    phone: String(member.phone ?? app.phone ?? ""),
    physical_address: String(app.physical_address ?? ""),
    region: String(app.region ?? ""),
    nationality: String(app.nationality ?? ""),
    gender: String(app.gender ?? ""),
    date_of_birth: String(app.date_of_birth ?? ""),
    ahpc_registration_number: String(app.ahpc_registration_number ?? ""),
    practice_area: String(app.practice_area ?? ""),
    sector: (app.sector as "private" | "public" | undefined) ?? "private",
    government_facility_name: String(app.government_facility_name ?? ""),
    work_address: String(app.work_address ?? ""),
  };

  const form = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  async function onSubmit(values: ProfileValues) {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...values };
      if (!isProfessional) {
        delete payload.ahpc_registration_number;
        delete payload.practice_area;
        delete payload.sector;
        delete payload.government_facility_name;
        delete payload.work_address;
      }
      const result = await updateMemberProfile(payload, accessToken);
      toast.success("Your details have been updated.");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["member-dashboard"] });
      void result;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit your details</DialogTitle>
          <DialogDescription>
            Update your personal information. Your PPAU registration number cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telephone</FormLabel>
                  <FormControl>
                    <PhoneInput value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        {GENDERS.map((g) => (
                          <div key={g} className="flex items-center gap-2">
                            <RadioGroupItem value={g} id={`edit-${g}`} />
                            <Label htmlFor={`edit-${g}`}>{g}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <CountrySelect value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="physical_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isProfessional && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ahpc_registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AHPC Registration No.</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          {SECTORS.map((s) => (
                            <div key={s} className="flex items-center gap-2">
                              <RadioGroupItem value={s} id={`edit-${s}`} />
                              <Label htmlFor={`edit-${s}`}>
                                {s === "private" ? "Private" : "Public"}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="practice_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice area</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRACTICE_AREAS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("sector") === "public" && (
                  <FormField
                    control={form.control}
                    name="government_facility_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Government facility</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="work_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <p className="text-xs text-muted-foreground">
              PPAU registration number (
              <span className="font-mono">{String(member.membership_number ?? "")}</span>) is locked
              and cannot be edited.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
