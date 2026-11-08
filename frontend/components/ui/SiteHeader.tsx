"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoUser } from "@/lib/session";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { Bell, Menu, X } from "lucide-react";
import { NotificationBadgeLink } from "@/components/notifications/NotificationBadgeLink";
import { CivoraLogo } from "@/components/ui/CivoraLogo";

/**
 * Top header for citizens and logged-out visitors. Staff accounts skip it
 * entirely and get the sticky left sidebar instead — see AppShell.
 */
const links = [
  { href: "/", label: "Home" },
  { href: "/submit", label: "Register Grievance" },
  { href: "/track", label: "Track Grievance" },
];

export function SiteHeader() {
  const { user, signOut } = useDemoUser();
  const { language, setLanguage, t } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkIsActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
      <div className="flex h-15 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-1 min-w-0">
          <CivoraLogo href="/" size="sm" showWordmark={true} showTagline={false} />
          <span className="hidden ml-3 pl-3 border-l border-slate-200 text-xs font-medium text-slate-500 lg:inline">
            AI-Powered Grievance Redressal
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1.5 md:flex shrink-0" aria-label="Primary">
          {[...links, ...(user ? [{ href: "/profile", label: "Profile" }] : [])].map((l) => {
            const active = linkIsActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }`}
              >
                {l.href === "/" ? t("home") : l.href === "/submit" ? t("register") : l.href === "/track" ? t("track") : t("profile")}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center justify-end gap-2.5 flex-1 min-w-0">
          <label className="sr-only" htmlFor="language-select">{t("language")}</label>
          <select
            id="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="h-8.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            {LANGUAGES.map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
          {user ? (
            <>
              <NotificationBadgeLink Icon={Bell} compact className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900" />
              <div className="hidden items-center gap-2 sm:flex">
                <span className="max-w-40 truncate text-xs font-medium text-slate-700">
                  {user.email || user.citizen_id || user.name}
                </span>
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
                  Citizen
                </span>
              </div>
              <button
                onClick={signOut}
                className="rounded-md border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-2xs cursor-pointer"
              >
                {t("signOut")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-[#101D32] px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#192B45]"
            >
              {t("signIn")}
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <NotificationBadgeLink
              Icon={Bell}
              compact
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            />
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-5 shadow-lg md:hidden animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
            {[...links, ...(user ? [{ href: "/profile", label: "Profile" }] : [])].map((l) => {
              const active = linkIsActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-teal-50 text-teal-800 border border-teal-200/80"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {l.href === "/"
                    ? t("home")
                    : l.href === "/submit"
                      ? t("register")
                      : l.href === "/track"
                        ? t("track")
                        : t("profile")}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-[#E2E8F0] pt-4 space-y-3">
            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <label htmlFor="mobile-language-select" className="text-xs font-semibold text-slate-600">
                {t("language")}
              </label>
              <select
                id="mobile-language-select"
                value={language}
                onChange={(event) => setLanguage(event.target.value as typeof language)}
                className="h-8.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-teal-600 focus:outline-none"
              >
                {LANGUAGES.map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                <div className="truncate text-xs font-medium text-slate-600">
                  {user.email || user.citizen_id || user.name}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  {t("signOut")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-md bg-[#101D32] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#192B45]"
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
