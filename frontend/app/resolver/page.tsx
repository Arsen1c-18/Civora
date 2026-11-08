"use client";

import { ResolverGate } from "@/components/resolver/ResolverGate";
import { ResolverWorkspace } from "@/components/resolver/ResolverWorkspace";

export default function ResolverPage() {
  return <ResolverGate><div className="min-h-[calc(100vh-4rem)] bg-[#F3F6F8] px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6"><span className="text-xs font-bold uppercase tracking-wider text-teal-700">Case Management</span><h1 className="mt-1 text-2xl font-bold text-[#101D32]">My work</h1><p className="mt-1 text-sm text-slate-500">View and update the grievances assigned to your department account.</p></div><ResolverWorkspace /></div></ResolverGate>;
}
