"use client";

import { ShieldCheck } from "lucide-react";
import { useDemoUser } from "@/lib/session";

/** Shared admin page header (title, subtitle, signed-in identity). */
export function AdminHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { user } = useDemoUser();

  return (
    <div className="border-b border-[#E2E8F0] bg-white px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#101D32]">{title}</h1>
            <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
              <ShieldCheck size={12} className="text-teal-600" />
              CIVORA Admin
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">{subtitle}</p>
        </div>
        {user && (
          <span className="text-xs text-slate-500">
            Signed in as: <strong className="font-semibold text-slate-800">{user.email || user.citizen_id || user.name}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
