import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllLeads,
  useAllTasks,
  useCallerProfile,
} from "../hooks/useQueries";
import { CampaignsPage } from "../pages/CampaignsPage";
import { ContentPage } from "../pages/ContentPage";
import { Dashboard } from "../pages/Dashboard";
import { LeadsPage } from "../pages/LeadsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { StaffPage } from "../pages/StaffPage";
import { TasksPage } from "../pages/TasksPage";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  isAdmin: boolean;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface Notification {
  id: string;
  type: "task" | "lead";
  message: string;
  timestamp: number;
}

const STORAGE_KEY = "readNotifIds";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function AppShell({ isAdmin, currentPage, onNavigate }: AppShellProps) {
  const { identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: leads } = useAllLeads(isAdmin);
  const { data: tasks } = useAllTasks(isAdmin);
  const [search, setSearch] = useState("");
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);
  const [notifOpen, setNotifOpen] = useState(false);

  const principal = identity?.getPrincipal().toString() ?? "";
  const displayName =
    profile?.fullName || (principal ? `${principal.slice(0, 8)}...` : "User");
  const initials = displayName.slice(0, 2).toUpperCase();

  // Compute notifications
  const notifications = useMemo<Notification[]>(() => {
    const now = Date.now();
    const result: Notification[] = [];

    // New leads in last 24h
    for (const lead of leads ?? []) {
      const ms = Number(lead.createdAt) / 1_000_000;
      if (now - ms < 86_400_000) {
        result.push({
          id: `lead-new-${lead.id.toString()}`,
          type: "lead",
          message: `New lead: ${lead.name}`,
          timestamp: ms,
        });
      }
    }

    // High priority pending/in-progress tasks
    for (const task of tasks ?? []) {
      if (task.priority === "High" && task.status !== "Done") {
        result.push({
          id: `task-high-${task.id.toString()}`,
          type: "task",
          message: `High priority task: ${task.title}`,
          timestamp: Number(task.dueDate) / 1_000_000,
        });
      } else if (
        (task.status === "Pending" || task.status === "InProgress") &&
        task.priority !== "High"
      ) {
        result.push({
          id: `task-pending-${task.id.toString()}`,
          type: "task",
          message: `Pending: ${task.title}`,
          timestamp: Number(task.dueDate) / 1_000_000,
        });
      }
    }

    return result.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [leads, tasks]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const n of notifications) next.add(n.id);
      saveReadIds(next);
      return next;
    });
  };

  // Persist readIds when they change
  useEffect(() => {
    saveReadIds(readIds);
  }, [readIds]);

  const pageTitles: Record<Page, string> = {
    dashboard: "Dashboard",
    leads: "Leads",
    content: "Content",
    tasks: "Tasks",
    campaigns: "Campaigns",
    settings: "Settings",
    reports: "Reports",
    staff: "Staff Management",
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isAdmin={isAdmin}
      />

      {/* Main area */}
      <div className="ml-60 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-background/80 backdrop-blur-sm border-b border-border">
          <div>
            <h1 className="font-display font-semibold text-lg text-foreground">
              {pageTitles[currentPage]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="header.search_input"
                className="pl-8 h-8 w-56 bg-muted/30 border-border text-sm"
              />
            </div>

            {/* Notification bell */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  data-ocid="header.notifications.button"
                >
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-card border-border p-0"
                data-ocid="header.notifications.dropdown_menu"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-semibold text-foreground">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      data-ocid="header.notifications.mark_all.button"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !readIds.has(notif.id);
                      return (
                        <DropdownMenuItem
                          key={notif.id}
                          className={`flex items-start justify-between gap-2 px-4 py-3 cursor-default border-b border-border/50 last:border-0 focus:bg-muted/30 ${
                            isUnread ? "bg-primary/5" : ""
                          }`}
                          onSelect={(e) => e.preventDefault()}
                          data-ocid="notifications.item"
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}
                            >
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                              {new Date(notif.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => markRead(notif.id)}
                              className="flex-shrink-0 p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                              data-ocid="notifications.mark_read.button"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground max-w-[100px] truncate">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {currentPage === "dashboard" && <Dashboard isAdmin={isAdmin} />}
          {currentPage === "leads" && <LeadsPage isAdmin={isAdmin} />}
          {currentPage === "content" && <ContentPage />}
          {currentPage === "tasks" && <TasksPage isAdmin={isAdmin} />}
          {currentPage === "campaigns" && <CampaignsPage isAdmin={isAdmin} />}
          {currentPage === "settings" && <SettingsPage isAdmin={isAdmin} />}
          {currentPage === "reports" && <ReportsPage />}
          {currentPage === "staff" && isAdmin && <StaffPage />}
        </main>
      </div>
    </div>
  );
}
