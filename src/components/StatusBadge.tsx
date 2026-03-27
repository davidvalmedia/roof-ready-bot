import type { LeadStatus } from "@/types/lead";

const config: Record<LeadStatus, { label: string; className: string }> = {
  neu: { label: "New", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  qualifiziert: { label: "Qualified", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  termin_geplant: { label: "Scheduled", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  abgelehnt: { label: "Rejected", className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold ${className}`}>
      {label}
    </span>
  );
}
