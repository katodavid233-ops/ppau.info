import { Link, useRouterState } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  UserCheck,
  UserX,
  Users,
  Upload,
  LogOut,
  BookOpen,
  GraduationCap,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  search?: { type: "professional" | "student" };
};

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    to: "/admin/applications",
    search: { type: "professional" as const },
    label: "Prof. applications",
    icon: FileText,
  },
  {
    to: "/admin/applications",
    search: { type: "student" as const },
    label: "Student applications",
    icon: FileText,
  },
  { to: "/admin/forms/professional", label: "Professional form", icon: GraduationCap },
  { to: "/admin/forms/student", label: "Student form", icon: BookOpen },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  {
    to: "/admin/members/accepted",
    search: { type: "professional" as const },
    label: "Professional members",
    icon: UserCheck,
  },
  {
    to: "/admin/members/accepted",
    search: { type: "student" as const },
    label: "Student members",
    icon: UserCheck,
  },
  {
    to: "/admin/members/rejected",
    search: { type: "professional" as const },
    label: "Rejected (prof.)",
    icon: UserX,
  },
  {
    to: "/admin/members/rejected",
    search: { type: "student" as const },
    label: "Rejected (student)",
    icon: UserX,
  },
  { to: "/admin/contact", label: "Contact page", icon: MessageSquare },
  { to: "/admin/email/templates", label: "Email", icon: Mail },
  { to: "/admin/admins", label: "Admins", icon: Users },
  { to: "/admin/migration", label: "Import CSV", icon: Upload },
];

function isNavActive(pathname: string, search: Record<string, unknown>, item: NavItem): boolean {
  if (item.exact) return pathname === item.to;
  const pathMatch = pathname === item.to || pathname.startsWith(`${item.to}/`);
  if (!pathMatch) return false;
  if (item.search?.type) {
    const current = search.type === "student" ? "student" : "professional";
    return current === item.search.type;
  }
  return true;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname, search } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, search: s.location.search as Record<string, unknown> }),
  });
  const navigate = useNavigate();

  async function logout() {
    await signOut();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] gap-0 lg:gap-8">
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-white rounded-l-2xl py-6 px-3">
        <div className="px-3 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            PPAU Admin
          </p>
          <p className="text-sm font-bold text-foreground mt-1">Secretariat</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map((item) => {
            const active = isNavActive(pathname, search, item);
            const Icon = item.icon;
            return (
              <Link
                key={`${item.to}-${item.label}`}
                to={item.to}
                search={item.search}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" className="justify-start gap-2 mt-4" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex flex-wrap gap-2 mb-6 pb-4 border-b overflow-x-auto">
          {nav.map((item) => {
            const active = isNavActive(pathname, search, item);
            return (
              <Link key={`${item.to}-${item.label}`} to={item.to} search={item.search}>
                <Button size="sm" variant={active ? "default" : "outline"} className="rounded-full text-xs">
                  {item.label}
                </Button>
              </Link>
            );
          })}
          <Button size="sm" variant="ghost" onClick={logout}>
            Sign out
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
