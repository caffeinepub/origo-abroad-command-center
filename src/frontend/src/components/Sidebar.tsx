import { cn } from "@/lib/utils";
import {
  BarChart2,
  CheckSquare,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

export function Sidebar({ currentPage, onNavigate, isAdmin }: SidebarProps) {
  const { clear } = useInternetIdentity();

  const navItems: {
    id: Page;
    label: string;
    icon: React.FC<{ className?: string }>;
    adminOnly?: boolean;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: Users },
    { id: "content", label: "Content", icon: FileText },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "reports", label: "Reports", icon: BarChart2 },
    { id: "staff", label: "Staff", icon: ShieldCheck, adminOnly: true },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-display font-700 text-sm text-foreground leading-tight">
              Origo Abroad
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              Marketing Command Center
            </div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="px-5 pt-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Marketing Head
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav
        className="flex-1 px-3 pt-4 pb-2 space-y-0.5 overflow-y-auto"
        data-ocid="sidebar.panel"
      >
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              data-ocid={`sidebar.${item.id}.link`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left",
                active
                  ? "bg-primary/15 text-primary font-medium border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-sidebar-border pt-3">
        <button
          type="button"
          onClick={clear}
          data-ocid="sidebar.logout.button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <div className="mt-3 px-3 text-[10px] text-muted-foreground/50 text-center">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/50 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </aside>
  );
}
