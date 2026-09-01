import type { ContactItem } from "@/lib/contact/defaults";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const ICON_LABELS = {
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  clock: Clock,
} as const;

type Props = {
  items: ContactItem[];
};

export function ContactDetailsList({ items }: Props) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No contact details on the public page. Add rows under Page settings → Contact details.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Type</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Contact / value</TableHead>
            <TableHead>Subtext</TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, i) => {
            const Icon = ICON_LABELS[item.icon] ?? Mail;
            return (
              <TableRow key={`${item.label}-${i}`}>
                <TableCell>
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                </TableCell>
                <TableCell className="font-medium text-sm">{item.label}</TableCell>
                <TableCell className="text-sm">{item.value}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.sub || "—"}</TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">
                  {item.href ? (
                    <a href={item.href} className="text-primary underline" target="_blank" rel="noreferrer">
                      {item.href}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
