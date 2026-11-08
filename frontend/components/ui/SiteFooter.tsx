import Link from "next/link";
import { MapPin, Mail, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { CivoraLogo } from "@/components/ui/CivoraLogo";

const quickLinks: { href: string; key: MessageKey }[] = [
  { href: "/", key: "home" },
  { href: "/submit", key: "register" },
  { href: "/track", key: "track" },
  { href: "/login", key: "signIn" },
  { href: "/register", key: "createAccount" },
];

const citizenServices: MessageKey[] = [
  "svcRegister",
  "svcTrack",
  "svcAssign",
  "svcAi",
];

const contact: { Icon: LucideIcon; key?: MessageKey; text?: string }[] = [
  { Icon: MapPin, key: "contactLocation" },
  { Icon: Mail, text: "support@civora.in" },
];

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-[#E2E8F0] bg-white text-slate-600">
      {/* Main footer columns */}
      <div className="grid gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="lg:col-span-5 space-y-3">
          <CivoraLogo size="sm" showWordmark={true} showTagline={false} />
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
            AI-Powered Grievance Redressal & Management
          </p>
          <p className="text-xs italic text-slate-500">
            &ldquo;Every grievance deserves a resolution.&rdquo;
          </p>
          <p className="text-xs leading-relaxed text-slate-500 max-w-md">
            {t("footerAbout")}
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-teal-600 shrink-0" />
            <span>Human-in-the-Loop Redressal & Institutional Oversight</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
            {t("footerQuickLinks")}
          </p>
          <ul className="mt-3.5 space-y-2.5 text-xs text-slate-600">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors hover:text-teal-700 hover:underline"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Citizen services */}
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
            {t("footerServicesHeading")}
          </p>
          <ul className="mt-3.5 space-y-2.5 text-xs text-slate-600">
            {citizenServices.map((key) => (
              <li key={key} className="transition-colors hover:text-slate-900">
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
            {t("footerContactHeading")}
          </p>
          <ul className="mt-3.5 space-y-2.5 text-xs text-slate-600">
            {contact.map(({ Icon, key, text }) => (
              <li key={key ?? text} className="flex items-start gap-2">
                <Icon size={14} className="mt-0.5 shrink-0 text-teal-600" />
                <span className="leading-relaxed">
                  {key ? t(key) : text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Centered bottom footer: accountability and copyright */}
      <div className="border-t border-[#E2E8F0] py-6 px-4 text-center space-y-2 sm:px-6 lg:px-8 bg-slate-50/60">
        <p className="text-xs leading-relaxed text-slate-500 max-w-3xl mx-auto">
          <span className="font-semibold text-slate-800">
            {t("accountabilityLabel")}
          </span>{" "}
          {t("accountabilityText")}
        </p>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} CIVORA &mdash; AI-Powered Grievance Redressal & Management Platform.
        </p>
      </div>
    </footer>
  );
}
