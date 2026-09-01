import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MembershipTypeFilter = "professional" | "student";

type Props = {
  value: MembershipTypeFilter;
  onChange: (value: MembershipTypeFilter) => void;
  professionalCount?: number;
  studentCount?: number;
  className?: string;
};

export function MembershipTypeToggle({
  value,
  onChange,
  professionalCount,
  studentCount,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        type="button"
        size="sm"
        variant={value === "professional" ? "default" : "outline"}
        className="rounded-full"
        onClick={() => onChange("professional")}
      >
        Professional
        {professionalCount != null ? ` (${professionalCount})` : ""}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "student" ? "default" : "outline"}
        className="rounded-full"
        onClick={() => onChange("student")}
      >
        Student
        {studentCount != null ? ` (${studentCount})` : ""}
      </Button>
    </div>
  );
}

export function filterByMembershipType<T extends { membership_type: string }>(
  items: T[],
  type: MembershipTypeFilter,
): T[] {
  return items.filter((i) => i.membership_type === type);
}

export function countByMembershipType<T extends { membership_type: string }>(
  items: T[],
): { professional: number; student: number } {
  return {
    professional: items.filter((i) => i.membership_type === "professional").length,
    student: items.filter((i) => i.membership_type === "student").length,
  };
}
