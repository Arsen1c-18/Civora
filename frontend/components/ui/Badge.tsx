"use client";

import { clsx } from "clsx";
import { useI18n, type MessageKey } from "@/lib/i18n";

export type BadgeTone = "teal" | "navy" | "orange" | "dark" | "grey" | "outline" | "emerald" | "amber" | "rose" | "blue";

const tones: Record<BadgeTone, string> = {
  teal: "bg-teal-50 text-teal-800 border border-teal-200/80 font-medium",
  navy: "bg-[#101D32]/10 text-[#101D32] border border-[#101D32]/20 font-medium",
  /* Legacy alias seamlessly rendered as Teal — no orange */
  orange: "bg-teal-50 text-teal-800 border border-teal-200/80 font-medium",
  dark: "bg-[#101D32] text-white border border-[#101D32]",
  grey: "bg-slate-100 text-slate-700 border border-slate-200/70",
  outline: "border border-slate-200 text-slate-700 bg-white shadow-2xs",
  emerald: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
  amber: "bg-amber-50 text-amber-800 border border-amber-200/80",
  rose: "bg-rose-50 text-rose-800 border border-rose-200/80",
  blue: "bg-blue-50 text-blue-800 border border-blue-200/80",
};

export function Badge({
  tone = "grey",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useI18n();
  const p = priority.toLowerCase();
  if (p === "high") return <Badge tone="rose">{t("priorityHigh")}</Badge>;
  if (p === "medium") return <Badge tone="amber">{t("priorityMedium")}</Badge>;
  return <Badge tone="grey">{t("priorityLow")}</Badge>;
}

const STATUS_KEYS: Record<string, MessageKey> = {
  submitted: "statusSubmitted",
  open: "statusOpen",
  triaged: "statusTriaged",
  pending_assignment: "statusPendingAssignment",
  ai_processing: "statusAiProcessing",
  assigned: "statusAssigned",
  in_progress: "statusInProgress",
  blocked: "statusBlocked",
  escalated: "statusEscalated",
  under_review: "statusUnderReview",
  resolution_submitted: "statusResolutionSubmitted",
  resolved: "statusResolved",
  closed: "statusClosed",
  rejected: "statusRejected",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const s = status.toLowerCase();
  const key = STATUS_KEYS[s];
  const label = key ? t(key) : status.replace("_", " ");
  if (s === "resolved" || s === "closed")
    return <Badge tone="emerald">{label}</Badge>;
  if (s === "open" || s === "submitted")
    return <Badge tone="teal">{label}</Badge>;
  if (s === "in_progress" || s === "assigned" || s === "triaged")
    return <Badge tone="blue">{label}</Badge>;
  if (s === "escalated" || s === "rejected" || s === "blocked")
    return <Badge tone="rose">{label}</Badge>;
  if (s === "under_review" || s === "pending_assignment")
    return <Badge tone="amber">{label}</Badge>;
  return <Badge tone="outline">{label}</Badge>;
}
