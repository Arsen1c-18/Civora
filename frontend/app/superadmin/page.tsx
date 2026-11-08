"use client";

import { SuperadminGate } from "@/components/superadmin/SuperadminGate";
import { SuperadminWorkspace } from "@/components/superadmin/SuperadminWorkspace";

export default function SuperadminPage() {
  return <SuperadminGate><div className="min-h-[calc(100vh-4rem)] bg-[#F3F6F8] px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6"><span className="text-xs font-bold uppercase tracking-wider text-teal-700">Enterprise Control</span><h1 className="mt-1 text-2xl font-bold text-[#101D32]">System administration</h1><p className="mt-1 text-sm text-slate-500">Manage user accounts, departments, and security audit log.</p></div><SuperadminWorkspace /></div></SuperadminGate>;
}
