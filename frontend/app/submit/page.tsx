"use client";

import { SubmitForm } from "@/components/grievance/SubmitForm";
import Link from "next/link";
import { useDemoUser } from "@/lib/session";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";

export default function SubmitPage() {
  const { user, isLoading } = useDemoUser();
  const { t } = useI18n();
  if (isLoading) return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-ink-500">{t("checkingSession")}</div>;
  if (!user) return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50/40 px-4 py-12"><Card className="w-full max-w-md text-center"><CardBody className="space-y-4 p-8"><h1 className="text-xl font-bold text-ink-950">{t("signinToSubmitTitle")}</h1><p className="text-sm leading-6 text-ink-600">{t("signinToSubmitText")}</p><Link href="/login?next=/submit"><Button className="w-full">{t("signinToContinue")}</Button></Link><p className="text-xs text-ink-500">{t("signinToSubmitHint")}</p></CardBody></Card></div>;
  return (
    <div className="bg-[#F3F6F8] min-h-[calc(100vh-4rem)]">
      {/* Page header — full bleed */}
      <div className="border-b border-[#E2E8F0] bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
            Civic Intake Portal
          </span>
          <h1 className="mt-1 text-lg font-bold tracking-tight text-[#101D32] sm:text-2xl">
            {t("registerSubtitle")}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm">
            {t("submitPageDesc")}
          </p>
        </div>
      </div>

      {/* Centered full-width Complaint Details form */}
      <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <SubmitForm />
      </div>
    </div>
  );
}
