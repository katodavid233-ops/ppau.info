import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import {
  fetchPublicMembersDirectory,
  registrationDisplay,
} from "@/lib/membership/public-members";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, EyeOff } from "lucide-react";
import { getCurrentUser, getRoleFromUser } from "@/lib/auth/session";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/registered-subscribed-members")({
  head: () =>
    pageHead({
      title: "Registered Subscribed Members",
      description:
        "Official public directory of registered subscribed members of the Pharmacy Professionals Association of Uganda.",
      path: "/registered-subscribed-members",
    }),
  component: RegisteredSubscribedMembers,
});

function RegisteredSubscribedMembers() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user) setIsAdmin(getRoleFromUser(user) === "admin");
    })();
  }, []);

  const { data: members, isLoading, error } = useQuery({
    queryKey: ["public-members-directory"],
    queryFn: fetchPublicMembersDirectory,
    enabled: isSupabaseConfigured,
  });

  const err = error instanceof Error ? error.message : error ? "Could not load member list." : null;

  function toggleContact(id: string) {
    setRevealedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Registered Subscribed Members List"
        subtitle="Pharmacy Professionals Association of Uganda (PPAU) — active members from the official registry."
      />

      <section className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {!isSupabaseConfigured && (
            <p className="text-sm text-muted-foreground">
              Member directory is not available until the membership portal is configured.
            </p>
          )}

          {err && (
            <p className="text-sm text-destructive font-medium" role="alert">
              {err}
            </p>
          )}

          {isSupabaseConfigured && isLoading && (
            <p className="text-sm text-muted-foreground">Loading member list…</p>
          )}

          {members && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {members.length} active member{members.length === 1 ? "" : "s"}
              </p>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center rounded-2xl border bg-white">
                  No active members in the registry yet.
                </p>
              ) : (
                <>
                  {(["professional", "student"] as const).map((type) => {
                    const filtered = members.filter((m) => m.membership_type === type);
                    if (filtered.length === 0) return null;
                    return (
                      <div key={type} className="mb-10 last:mb-0">
                        <h2 className="text-lg font-semibold mb-3 capitalize">{type} Members</h2>
                        <div className="w-full overflow-x-auto rounded-2xl border border-border bg-white shadow-soft">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                <TableHead className="whitespace-nowrap font-semibold w-16">No.</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold">Name</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold">PPAU Membership No.</TableHead>
                                {isAdmin && (
                                  <TableHead className="whitespace-nowrap font-semibold">
                                    Registration No.
                                  </TableHead>
                                )}
                                {isAdmin && (
                                  <TableHead className="whitespace-nowrap font-semibold">Contact</TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filtered.map((m, i) => (
                                <TableRow key={m.id}>
                                  <TableCell className="text-sm text-muted-foreground">{i + 1}</TableCell>
                                  <TableCell className="text-sm font-medium">{m.full_name}</TableCell>
                                  <TableCell className="text-sm font-mono">{m.membership_number}</TableCell>
                                  {isAdmin && (
                                    <TableCell className="text-sm font-mono">
                                      {registrationDisplay(m)}
                                    </TableCell>
                                  )}
                                  {isAdmin && (
                                    <TableCell className="text-sm">
                                      {m.phone?.trim() ? (
                                        <button
                                          onClick={() => toggleContact(m.id)}
                                          className="inline-flex items-center gap-1.5 text-primary hover:text-secondary transition-colors text-xs font-semibold"
                                        >
                                          {revealedContacts.has(m.id) ? (
                                            <><EyeOff className="h-3.5 w-3.5" /> {m.phone}</>
                                          ) : (
                                            <><Eye className="h-3.5 w-3.5" /> Show contact</>
                                          )}
                                        </button>
                                      ) : "—"}
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
