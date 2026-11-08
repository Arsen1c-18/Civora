"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Bell,
  Home,
  Inbox,
  LineChart,
  LogOut,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NotificationBadgeLink } from "@/components/notifications/NotificationBadgeLink";
import { CivoraLogo } from "@/components/ui/CivoraLogo";

export interface SidebarLink {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const sharedLinks: SidebarLink[] = [];

const linksByRole: Record<string, SidebarLink[]> = {
  SUPERADMIN: [
    { href: "/", label: "Home", Icon: Home },
    { href: "/superadmin", label: "System Admin", Icon: ShieldCheck },
    { href: "/admin", label: "Grievance Queue", Icon: Inbox },
    { href: "/admin/analytics", label: "Analytics", Icon: LineChart },
  ],
  ADMIN: [
    { href: "/", label: "Home", Icon: Home },
    { href: "/admin", label: "Grievance Queue", Icon: Inbox },
    { href: "/admin/employees", label: "Employees", Icon: Users },
    { href: "/admin/analytics", label: "Analytics", Icon: LineChart },
  ],
  RESOLVER: [{ href: "/", label: "Home", Icon: Home }, { href: "/resolver", label: "My Work", Icon: Briefcase }],
};
for (const role of ["ADMIN", "RESOLVER", "SUPERADMIN"]) {
  linksByRole[role].push({ href: "/notifications", label: "Notifications", Icon: Bell });
  linksByRole[role].push({ href: "/profile", label: "Profile", Icon: User });
}

/** Per-role sidebar links; unknown/citizen roles get the shared pair only. */
export const linksForRole = (role: string | undefined, departmentId?: string | null): SidebarLink[] => {
  const links = (role && linksByRole[role]) || sharedLinks;
  return role === "ADMIN" && !departmentId
    ? links.filter((link) => link.href !== "/admin/employees")
    : links;
};

export const roleLabelOf = (role: string | undefined) =>
  role === "SUPERADMIN"
    ? "System admin"
    : role === "ADMIN"
      ? "Department admin"
      : role === "RESOLVER"
        ? "Resolver"
        : "Citizen";

/**
 * Persistent sticky sidebar that replaces the top header for staff accounts
 * (department admin, resolver, superadmin). Always visible.
 * Styled in institutional Deep Navy (#101D32) with Teal (#0D9488) active indicators.
 */
export function StaffSidebar({
  links,
  email,
  roleLabel,
  onSignOut,
}: {
  links: SidebarLink[];
  email?: string;
  roleLabel: string;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const linkIsActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-[#192B45] bg-[#101D32] text-slate-200 sm:w-64 z-30"
      aria-label="Staff navigation"
    >
      <div className="flex h-15 items-center border-b border-[#192B45] px-3 sm:px-4">
        <CivoraLogo href="/" size="sm" variant="navy" showWordmark={true} showTagline={false} />
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 sm:p-3"
        aria-label="Staff links"
      >
        {links.map(({ href, label, Icon }) => {
          const active = linkIsActive(href);
          return href === "/notifications" ? (
            <NotificationBadgeLink
              key={`${label}-${href}`}
              Icon={Icon}
              label={label}
              active={active}
              className={`flex items-center justify-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors sm:justify-start ${
                active
                  ? "bg-[#0D9488] text-white shadow-xs"
                  : "text-slate-300 hover:bg-[#192B45] hover:text-white"
              }`}
            />
          ) : (
            <Link
              key={`${label}-${href}`}
              href={href}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`flex items-center justify-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors sm:justify-start ${
                active
                  ? "bg-[#0D9488] text-white shadow-xs"
                  : "text-slate-300 hover:bg-[#192B45] hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#192B45] p-2 sm:p-3 bg-[#0B1320]/60">
        <p className="hidden truncate text-xs font-medium text-slate-300 sm:block">
          {email || "Staff"}
        </p>
        <span className="mt-1 hidden sm:inline-block rounded-sm border border-teal-500/40 bg-teal-950/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-300">
          {roleLabel}
        </span>
        <button
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#192B45] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-[#243B5E] hover:text-white sm:mt-3 cursor-pointer"
        >
          <LogOut size={14} className="shrink-0" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
