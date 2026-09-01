import { Link, useRouterState } from "@tanstack/react-router";
import { Mail, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/admin/email/templates", label: "Templates", icon: Mail, match: "/admin/email/templates" },
  { to: "/admin/email/settings", label: "Email settings", icon: Settings, match: "/admin/email/settings" },
] as const;

export function EmailSectionNav({ title = "Email" }: { title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <nav className="flex gap-2 border-b border-border pb-px">
        {tabs.map((tab) => {
          const active =
            tab.to === "/admin/email/templates"
              ? pathname === tab.to || pathname.startsWith("/admin/email/templates/")
              : pathname.startsWith(tab.match);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
