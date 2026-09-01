import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAdmins, createAdmin, removeAdminRole } from "@/lib/admin/api";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Shield } from "lucide-react";

export const Route = createFileRoute("/admin/admins")({
  component: AdminsManagementPage,
});

function AdminsManagementPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: admins, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { admins: list } = await listAdmins();
      return list;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["admin-current-user"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      return user;
    },
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createAdmin(email, password, fullName || undefined);
      toast.success(`Admin ${email} created`);
      setEmail("");
      setPassword("");
      setFullName("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setCreating(false);
    }
  }

  async function handleRemove(userId: string, userEmail: string) {
    if (userId === currentUser?.id) {
      toast.error("You cannot remove your own admin role");
      return;
    }
    if (!confirm(`Remove admin access for ${userEmail}?`)) return;
    try {
      await removeAdminRole(userId);
      toast.success("Admin role removed");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Admins management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Secretariat accounts with full portal access
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add admin
            </CardTitle>
            <CardDescription>Creates a new user with admin role</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="admin-name">Full name (optional)</Label>
                <Input id="admin-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={creating}>
                {creating ? "Creating…" : "Create admin"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Current admins</h2>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh</Button>
          </div>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          <div className="rounded-xl border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(admins ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <span className="font-medium">{a.email}</span>
                      {a.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-primary">(you)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.last_sign_in_at
                        ? new Date(a.last_sign_in_at).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {a.id !== currentUser?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleRemove(a.id, a.email)}
                        >
                          Remove admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!isLoading && !admins?.length && (
              <p className="text-center text-sm text-muted-foreground py-6">
                No admins listed. Deploy the admin-manage-users Edge Function.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
