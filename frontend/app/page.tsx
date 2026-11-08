"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Construction,
  Droplets,
  FileCheck2,
  FileText,
  FolderOpen,
  HeartPulse,
  Inbox,
  Landmark,
  Layers,
  MapPin,
  Mic,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAdminGrievanceFeed } from "@/components/admin/useAdminGrievanceFeed";
import { useDemoUser } from "@/lib/session";
import type { AuthUser } from "@/lib/types";
import { useResolverTasks } from "@/components/resolver/useResolverTasks";
import { Reveal } from "@/components/ui/Reveal";
import { canonicalDepartmentId } from "@/lib/departments";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { CivoraLogo } from "@/components/ui/CivoraLogo";

// Category items matching actual application categories & route preselection.
interface CategoryItem {
  id: string;
  nameKey: MessageKey;
  descKey: MessageKey;
  exampleKeys: MessageKey[];
  Icon: LucideIcon;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: "water",
    nameKey: "catWaterName",
    descKey: "catWaterDesc",
    exampleKeys: ["catWaterEx1", "catWaterEx2", "catWaterEx3"],
    Icon: Droplets,
  },
  {
    id: "roads",
    nameKey: "catRoadsName",
    descKey: "catRoadsDesc",
    exampleKeys: ["catRoadsEx1", "catRoadsEx2", "catRoadsEx3"],
    Icon: Construction,
  },
  {
    id: "electricity",
    nameKey: "catElectricityName",
    descKey: "catElectricityDesc",
    exampleKeys: ["catElectricityEx1", "catElectricityEx2", "catElectricityEx3"],
    Icon: Zap,
  },
  {
    id: "health",
    nameKey: "catHealthName",
    descKey: "catHealthDesc",
    exampleKeys: ["catHealthEx1", "catHealthEx2", "catHealthEx3"],
    Icon: HeartPulse,
  },
  {
    id: "governance",
    nameKey: "catGovName",
    descKey: "catGovDesc",
    exampleKeys: ["catGovEx1", "catGovEx2", "catGovEx3"],
    Icon: Landmark,
  },
  {
    id: "other",
    nameKey: "catOtherName",
    descKey: "catOtherDesc",
    exampleKeys: ["catOtherEx1", "catOtherEx2", "catOtherEx3"],
    Icon: FolderOpen,
  },
];

// Actual backend workflow stages
const WORKFLOW_STAGES: {
  step: string;
  titleKey: MessageKey;
  actorKey: MessageKey;
  textKey: MessageKey;
  slaKey: MessageKey;
}[] = [
  { step: "01", titleKey: "lc1Title", actorKey: "ovActorCitizen", textKey: "lc1Text", slaKey: "lc1Sla" },
  { step: "02", titleKey: "lc2Title", actorKey: "lcActorAi", textKey: "lc2Text", slaKey: "lc2Sla" },
  { step: "03", titleKey: "lc3Title", actorKey: "lcActorManager", textKey: "lc3Text", slaKey: "lc3Sla" },
  { step: "04", titleKey: "lc4Title", actorKey: "lcActorResolver", textKey: "lc4Text", slaKey: "lc4Sla" },
  { step: "05", titleKey: "lc5Title", actorKey: "lcActorManagerCitizen", textKey: "lc5Text", slaKey: "lc5Sla" },
];

const PREPARATION_CHECKLIST: {
  titleKey: MessageKey;
  textKey: MessageKey;
  required: boolean;
}[] = [
  { titleKey: "chk1Title", textKey: "chk1Text", required: true },
  { titleKey: "chk2Title", textKey: "chk2Text", required: true },
  { titleKey: "chk3Title", textKey: "chk3Text", required: false },
  { titleKey: "chk4Title", textKey: "chk4Text", required: false },
];

function StaffHomeOverview({ role, user }: { role: string; user: AuthUser }) {
  const adminFeed = useAdminGrievanceFeed(role !== "RESOLVER");
  const workerTasks = useResolverTasks(role === "RESOLVER");

  const scopedItems: import("@/lib/types").Grievance[] =
    role === "RESOLVER"
      ? workerTasks.items
      : role === "ADMIN" && user.departmentId
      ? adminFeed.items.filter(
          (item) =>
            canonicalDepartmentId(item.departmentId ?? item.category) ===
            canonicalDepartmentId(user.departmentId)
        )
      : adminFeed.items;

  const loading = role === "RESOLVER" ? workerTasks.loading : adminFeed.loading;

  const open = scopedItems.filter(
    (item) => !["RESOLVED", "CLOSED", "REJECTED"].includes(item.status?.toUpperCase() ?? "")
  ).length;

  const resolved = scopedItems.filter(
    (item) => ["RESOLVED", "CLOSED"].includes(item.status?.toUpperCase() ?? "")
  ).length;

  const urgent = scopedItems.filter(
    (item) => (item.priority ?? "").toUpperCase() === "HIGH" && !["RESOLVED", "CLOSED", "REJECTED"].includes(item.status?.toUpperCase() ?? "")
  ).length;

  const roleName =
    role === "SUPERADMIN"
      ? "Super Administrator"
      : role === "ADMIN"
      ? `Department Administrator (${user.departmentId ?? "All"})`
      : "Field Resolver";

  const actions =
    role === "SUPERADMIN"
      ? [
          {
            href: "/superadmin",
            label: "System administration",
            detail: "Manage users, departments, and inspect security audit logs.",
          },
          {
            href: "/admin",
            label: "Grievance queue",
            detail: "Review and reassign complaints across all departments.",
          },
          {
            href: "/admin/analytics",
            label: "Executive analytics",
            detail: "Inspect service performance, SLA compliance, and spatial hotspots.",
          },
        ]
      : role === "ADMIN"
      ? [
          {
            href: "/admin",
            label: "Grievance queue",
            detail: "Review and assign complaints for your department.",
          },
          {
            href: "/admin/employees",
            label: "Department workforce",
            detail: "Manage employee workload, assignments, and case distribution.",
          },
          {
            href: "/admin/analytics",
            label: "Executive analytics",
            detail: "Review trends, deadlines, and area concentrations.",
          },
        ]
      : [
          {
            href: "/resolver",
            label: "My tasks & workbench",
            detail: "Open assigned grievances, post progress updates, and submit resolutions.",
          },
        ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F6F8] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-teal-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
              Staff Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">{roleName}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101D32]">
            Operational Command Center
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Welcome back, {user.name || user.email}. Manage grievance workflows and institutional oversight.
          </p>
        </div>

        {role === "RESOLVER" && workerTasks.error && (
          <p
            role="alert"
            className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            Could not load your assigned tasks: {workerTasks.error}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              value: loading ? "—" : scopedItems.length,
              label: "Visible complaints",
              sub:
                role === "SUPERADMIN"
                  ? "Across the platform"
                  : role === "ADMIN"
                  ? "In your department"
                  : "Assigned to you",
            },
            {
              value: loading ? "—" : open,
              label: "Active workload",
              sub: "Pending resolution",
            },
            {
              value: loading ? "—" : resolved,
              label: "Resolved",
              sub: "Completed successfully",
            },
            {
              value: loading ? "—" : urgent,
              label: "High priority",
              sub: "Immediate attention",
            },
          ].map(({ value, label, sub }) => (
            <div
              key={label}
              className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-2xs"
            >
              <p className="text-2xl font-bold tracking-tight text-[#101D32]">{value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{label}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Workspaces & Action Centers
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-lg border border-[#E2E8F0] bg-white p-5 transition-all hover:border-teal-500 hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#101D32] group-hover:text-teal-700">
                    {action.label}
                  </p>
                  <ArrowRight size={14} className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-600" />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{action.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useDemoUser();
  const { t } = useI18n();
  const role = user?.role?.toUpperCase();

  // Keep staff operational home when logged in as resolver/admin/superadmin
  if (role === "ADMIN" || role === "RESOLVER" || role === "SUPERADMIN") {
    return <StaffHomeOverview role={role} user={user!} />;
  }

  return (
    <div className="overflow-hidden bg-[#F3F6F8] text-[#172033]">
      {/* ── Citizen Quick-Action Hub when signed in ── */}
      {user && (
        <section className="border-b border-[#E2E8F0] bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Citizen Workspace
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-[#101D32]">
                  Welcome, {user.name || user.email}
                </h1>
                <p className="text-xs text-slate-500">
                  Every grievance deserves a resolution. Submit, track, and monitor your cases in real-time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
                >
                  <PlusCircle size={15} />
                  <span>Submit Grievance</span>
                </Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Action 1: Submit */}
              <Link
                href="/submit"
                className="group flex flex-col justify-between rounded-lg border-2 border-teal-600 bg-teal-50/40 p-4 transition hover:bg-teal-50/80 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-600 text-white">
                      <PlusCircle size={18} />
                    </span>
                    <span className="text-[10px] font-bold uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      Fast Lodging
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#101D32]">
                    1. Submit a Grievance
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Voice or manual form with GPS location and photo evidence.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:underline">
                  <span>Register ticket</span> <ArrowRight size={12} />
                </div>
              </Link>

              {/* Action 2: Track */}
              <Link
                href="/track"
                className="group flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-white p-4 transition hover:border-teal-500 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-[#101D32]">
                      <Search size={18} />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Live Stages
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#101D32]">
                    2. Track Grievances
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Follow progress, timeline transitions, and assigned officers.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-teal-700">
                  <span>Track status</span> <ArrowRight size={12} />
                </div>
              </Link>

              {/* Action 3: Complaint History */}
              <Link
                href="/track"
                className="group flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-white p-4 transition hover:border-teal-500 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-[#101D32]">
                      <Inbox size={18} />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Archive
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#101D32]">
                    3. Complaint History
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Review previously resolved grievances and provide feedback.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-teal-700">
                  <span>View records</span> <ArrowRight size={12} />
                </div>
              </Link>

              {/* Action 4: Updates & Notifications */}
              <Link
                href="/notifications"
                className="group flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-white p-4 transition hover:border-teal-500 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-[#101D32]">
                      <Clock size={18} />
                    </span>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      Real-time
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#101D32]">
                    4. Check Updates
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Official announcements, assignment alerts, and SLA notifications.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-teal-700">
                  <span>Open alerts</span> <ArrowRight size={12} />
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── 1. Hero: Action-Oriented (Report + Track) ── */}
      <section className="relative border-b border-[#E2E8F0] bg-gradient-to-b from-white via-slate-50/50 to-[#F3F6F8]">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(13,148,136,0.18) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {/* CIVORA Brand Header with Logo & Descriptor */}
            <div className="animate-fade-up mb-6 flex flex-col items-center justify-center gap-3">
              <CivoraLogo size="lg" showWordmark={true} showTagline={false} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
                <ShieldCheck size={13} className="text-teal-600" />
                AI-Powered Grievance Redressal & Management
              </span>
            </div>

            <h1 className="animate-fade-up text-3xl font-extrabold tracking-tight text-[#101D32] sm:text-5xl sm:leading-[1.15]">
              {t("heroTitle")}
            </h1>

            <p className="animate-fade-up [animation-delay:80ms] mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              {t("heroSubtitle")}
            </p>

            {/* Primary & Secondary Actions */}
            <div className="animate-fade-up [animation-delay:160ms] mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2.5 rounded-md bg-[#0D9488] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0F766E] active:bg-[#115E59]"
              >
                <PlusCircle size={17} />
                <span>{t("heroCtaReport")}</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center gap-2 rounded-md border border-[#101D32] bg-white px-6 py-3.5 text-sm font-bold text-[#101D32] shadow-2xs transition hover:bg-slate-50 active:bg-slate-100"
              >
                <Search size={16} />
                <span>{t("heroCtaTrack")}</span>
              </Link>
            </div>

            {/* Trust & Transparency statement */}
            <div className="animate-fade-up [animation-delay:320ms] mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 border-t border-[#E2E8F0] pt-6 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck size={16} className="text-teal-600" />
                {t("heroTrustHuman")}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <MapPin size={16} className="text-teal-600" />
                {t("heroTrustGps")}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Clock size={16} className="text-slate-500" />
                {t("heroTrustAudit")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Grievance Redressal Process: 3 Clear Steps ── */}
      <section className="border-b border-[#E2E8F0] bg-white py-14 sm:py-18">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {t("ovBadge")}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#101D32] sm:text-3xl">
              {t("ovTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t("ovText")}</p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {/* Stage 1 */}
            <div className="relative rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-700">
                  {t("ovStageN", { n: "01" })}
                </span>
                <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase">
                  {t("ovActorCitizen")}
                </span>
              </div>
              <h3 className="mt-3.5 text-base font-bold text-[#101D32]">{t("ov1Title")}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{t("ov1Text")}</p>
            </div>

            {/* Stage 2 */}
            <div className="relative rounded-lg border border-teal-200 bg-teal-50/30 p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-700">
                  {t("ovStageN", { n: "02" })}
                </span>
                <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 uppercase">
                  {t("ovActorAiOfficer")}
                </span>
              </div>
              <h3 className="mt-3.5 text-base font-bold text-[#101D32]">{t("ov2Title")}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{t("ov2Text")}</p>
            </div>

            {/* Stage 3 */}
            <div className="relative rounded-lg border border-emerald-200 bg-emerald-50/30 p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-700">
                  {t("ovStageN", { n: "03" })}
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 uppercase">
                  {t("ovActorResolverCitizen")}
                </span>
              </div>
              <h3 className="mt-3.5 text-base font-bold text-[#101D32]">{t("ov3Title")}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{t("ov3Text")}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 3. Category Explorer: Interactive with Preselection ── */}
      <section className="border-b border-[#E2E8F0] py-14 sm:py-18 bg-[#F3F6F8]">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                {t("catBadge")}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#101D32] sm:text-3xl">
                {t("catTitle")}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{t("catText")}</p>
            </div>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
            >
              {t("catOpenForm")} <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_ITEMS.map((cat) => (
              <Link
                key={cat.id}
                href={`/submit?category=${cat.id}`}
                className="group relative flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-white p-5 transition hover:border-teal-500 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-teal-600"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white">
                      <cat.Icon size={20} />
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 transition group-hover:text-teal-700 flex items-center gap-1">
                      {t("catReport")} <ArrowRight size={12} />
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#101D32] group-hover:text-teal-900">
                    {t(cat.nameKey)}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{t(cat.descKey)}</p>
                </div>

                <div className="mt-4 border-t border-[#E2E8F0] pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("catCommon")}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                    {cat.exampleKeys.map((exKey) => (
                      <li key={exKey} className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{t(exKey)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── 4. Lifecycle & Plain Explanations ── */}
      <section className="border-b border-[#E2E8F0] bg-white py-14 sm:py-18">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {t("lcBadge")}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#101D32] sm:text-3xl">
              {t("lcTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t("lcText")}</p>
          </div>

          <div className="mt-8 space-y-3.5">
            {WORKFLOW_STAGES.map((s) => (
              <div
                key={s.step}
                className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#101D32] font-mono text-xs font-bold text-white">
                    {s.step}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#101D32]">{t(s.titleKey)}</h3>
                      <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                        {t(s.actorKey)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 leading-normal">{t(s.textKey)}</p>
                  </div>
                </div>

                <div className="shrink-0 border-t border-[#E2E8F0] pt-2 sm:border-0 sm:pt-0 sm:text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {t("lcTimeline")}
                  </span>
                  <span className="text-xs font-semibold text-teal-700">{t(s.slaKey)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50/50 p-4 text-xs text-slate-700">
            <p className="font-semibold text-[#101D32] flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-700" />
              {t("lcDelayedTitle")}
            </p>
            <p className="mt-1 leading-relaxed text-slate-600">
              {t("lcDelayedText1")}{" "}
              <Link href="/track" className="font-bold text-teal-700 underline">
                {t("lcTrackPortal")}
              </Link>
              {t("lcDelayedText2")}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── 5. Prepare Before Reporting: Practical Checklist ── */}
      <section className="border-b border-[#E2E8F0] py-14 sm:py-18 bg-[#F3F6F8]">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                {t("chkBadge")}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#101D32] sm:text-3xl">
                {t("chkTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("chkText")}</p>

              <div className="mt-6 space-y-3">
                {PREPARATION_CHECKLIST.map((item) => (
                  <div
                    key={item.titleKey}
                    className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-2xs"
                  >
                    <CheckCircle2
                      size={18}
                      className={
                        item.required
                          ? "text-teal-600 mt-0.5 shrink-0"
                          : "text-slate-400 mt-0.5 shrink-0"
                      }
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#101D32]">{t(item.titleKey)}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.required
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.required ? t("chkRequired") : t("chkOptional")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 leading-normal">{t(item.textKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Call to Action Card */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#101D32] text-teal-400">
                <FileCheck2 size={22} />
              </span>
              <h3 className="mt-4 text-xl font-bold text-[#101D32]">{t("ctaTitle")}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">{t("ctaText")}</p>
              <div className="mt-6 space-y-2.5">
                <Link
                  href="/submit"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0D9488] px-4 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#0F766E]"
                >
                  {t("ctaPrimary")} <ArrowRight size={15} />
                </Link>
                <Link
                  href="/track"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  {t("ctaSecondary")}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 6. Concrete Trust & AI Transparency ── */}
      <section className="bg-white py-14 sm:py-18">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {t("trustBadge")}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#101D32] sm:text-3xl">
              {t("trustTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t("trustText")}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-teal-50 text-teal-700">
                <Layers size={17} />
              </span>
              <h3 className="mt-3 text-xs font-bold uppercase tracking-wide text-[#101D32]">
                {t("trust1Title")}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-normal">{t("trust1Text")}</p>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-teal-50 text-teal-700">
                <Users size={17} />
              </span>
              <h3 className="mt-3 text-xs font-bold uppercase tracking-wide text-[#101D32]">
                {t("trust2Title")}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-normal">{t("trust2Text")}</p>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-teal-50 text-teal-700">
                <FileText size={17} />
              </span>
              <h3 className="mt-3 text-xs font-bold uppercase tracking-wide text-[#101D32]">
                {t("trust3Title")}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-normal">{t("trust3Text")}</p>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-teal-50 text-teal-700">
                <CheckCircle2 size={17} />
              </span>
              <h3 className="mt-3 text-xs font-bold uppercase tracking-wide text-[#101D32]">
                {t("trust4Title")}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-normal">{t("trust4Text")}</p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
