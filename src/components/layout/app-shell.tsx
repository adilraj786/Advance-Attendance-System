import { useState, useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Award,
  Bot,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  FileUp,
  History,
  Megaphone,
  MessageSquare,
  ScrollText,
  ShieldCheck,
  Table2,
  Layers,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  QrCode,
  Settings,
  Sun,
  Trophy,
  Users,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COLLEGE, CURRENT_USER, type Role } from "@/lib/data";
import { useTheme, ROLE_HOME, cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";
import { NotificationsPanel } from "./notifications-panel";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; roles: Role[] };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Overview",
    items: [
      { to: "/student", label: "Student", icon: LayoutDashboard, roles: ["student"] },
      { to: "/teacher", label: "Teaching", icon: Users, roles: ["teacher", "hod"] },
      { to: "/admin", label: "Institution & Dept", icon: LayoutDashboard, roles: ["admin", "hod"] },
      { to: "/parent", label: "My child", icon: GraduationCap, roles: ["parent"] },
    ],
  },
  {
    group: "Attendance",
    items: [
      { to: "/scan", label: "Scan QR", icon: QrCode, roles: ["student"] },
      { to: "/analytics", label: "Attendance matrix", icon: BarChart3, roles: ["student", "teacher", "hod", "admin", "parent"] },
      { to: "/leaderboard", label: "Leaderboard", icon: Trophy, roles: ["student", "teacher", "hod", "admin", "parent"] },
    ],
  },
  {
    group: "Academics",
    items: [
      { to: "/timetable", label: "Timetable", icon: Table2, roles: ["student", "teacher", "parent", "admin", "hod"] },
      { to: "/materials", label: "Notes & assignments", icon: FileUp, roles: ["student", "teacher", "hod"] },
      { to: "/holidays", label: "Holiday calendar", icon: CalendarDays, roles: ["student", "teacher", "admin", "hod", "parent"] },
      { to: "/announcements", label: "Announcements", icon: Megaphone, roles: ["student", "teacher", "hod", "admin", "parent"] },
      { to: "/assistant", label: "AI assistant", icon: Bot, roles: ["student", "teacher", "hod", "admin", "parent"] },
      { to: "/leave", label: "Leave request", icon: CalendarDays, roles: ["student"] },
      { to: "/eligibility", label: "Exam eligibility", icon: ShieldCheck, roles: ["student"] },
      { to: "/approvals", label: "Leave approvals", icon: ClipboardCheck, roles: ["teacher", "hod"] },
      { to: "/messages", label: "Chat with teacher", icon: MessageSquare, roles: ["parent"] },
      { to: "/semesters", label: "Semesters", icon: Layers, roles: ["admin", "hod"] },
      { to: "/audit-logs", label: "Audit logs", icon: ScrollText, roles: ["admin", "hod"] },
    ],
  },
  {
    group: "Account",
    items: [
      { to: "/settings", label: "Settings", icon: Settings, roles: ["student", "teacher", "hod", "admin", "parent"] },
      { to: "/devices", label: "Login history", icon: History, roles: ["student", "teacher", "hod", "admin", "parent"] },
    ],
  },
];

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {NAV.map((g) => {
        const items = g.items.filter((i) => i.roles.includes(role));
        if (!items.length) return null;
        return (
          <div key={g.group}>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {g.group}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-sm px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "h-4 w-[2px] rounded-full",
                          active ? "bg-accent" : "bg-transparent",
                        )}
                      />
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.7} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
        <CalendarCheck className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold leading-tight">Smart Attendance</p>
        <p className="truncate text-[11px] text-muted-foreground">Academic Portal</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, role, isAuthenticated, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  // Strict Role-Based Access Control (RBAC) & Route Guard
  const matchedNavItem = NAV.flatMap((g) => g.items).find((item) => item.to === pathname);
  const isUnauthorized = Boolean(matchedNavItem && !matchedNavItem.roles.includes(role));

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate({ to: "/" });
      return;
    }

    if (isUnauthorized && matchedNavItem) {
      toast.error("Strict Access Control: Unauthorized Portal", {
        id: "rbac-access-restricted",
        description: `Your ${role.toUpperCase()} account cannot access ${matchedNavItem.label}. Redirecting…`,
      });
      const timer = setTimeout(() => {
        navigate({ to: ROLE_HOME[role] });
      }, 400);
      return () => {
        clearTimeout(timer);
      };
    }

    return undefined;
  }, [loading, isAuthenticated, isUnauthorized, matchedNavItem, role, navigate]);

  const user = CURRENT_USER[role];
  const displayName = profile?.name || user?.name || "User";
  const displaySub = profile?.rollNumber || profile?.department || user?.sub || "";
  const initials = displayName
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully", {
      description: "Session terminated. Please sign in to continue.",
    });
    navigate({ to: "/" });
  };

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavLinks role={role} />
        </div>
        <div className="border-t border-sidebar-border px-4 py-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Smart Attendance System
            <br />
            Campus Academic Network
          </p>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm lg:hidden" aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-sidebar p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand />
                <NavLinks role={role} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold capitalize text-foreground">{role} workspace</p>
              <p className="truncate text-[11px] text-muted-foreground">Smart Attendance System · Live Ledger</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-9 w-9 rounded-xl"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" strokeWidth={1.7} /> : <Moon className="h-4 w-4" strokeWidth={1.7} />}
            </Button>
            <NotificationsPanel />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-left transition-all hover:border-accent shadow-xs">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/15 text-[11px] font-bold text-accent">
                    {initials}
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block truncate text-xs font-semibold leading-tight text-foreground">{displayName}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">{displaySub}</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-xl">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground p-2">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Signed in as</span>
                  <span className="mt-0.5 block text-sm font-bold text-foreground">{displayName}</span>
                  <span className="block text-[11px] text-muted-foreground font-mono truncate">{profile?.email || `${role}@campus.ac.in`}</span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                    {role} account
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" /> Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} asChild className="rounded-lg cursor-pointer text-destructive focus:text-destructive">
                  <Link to="/">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto max-w-[1200px] space-y-5 sm:space-y-6 px-3.5 py-4 sm:px-6 sm:py-8">
          {isUnauthorized ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <h2 className="text-xl font-bold text-foreground">Access Restricted by Security Policy</h2>
                <p className="text-xs text-muted-foreground">
                  Your <span className="font-semibold text-foreground uppercase">{role}</span> profile does not have permission to view or manage this partition ({pathname}).
                </p>
              </div>
              <Button onClick={() => navigate({ to: ROLE_HOME[role] })} className="bg-accent text-accent-foreground">
                Return to {role.toUpperCase()} Workspace
              </Button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
