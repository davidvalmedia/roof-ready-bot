import { LeadStatus } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  neu: { label: "Neu", className: "bg-primary/20 text-primary border-primary/30" },
  qualifiziert: { label: "Qualifiziert", className: "bg-success/20 text-success border-success/30" },
  termin_geplant: { label: "Termin geplant", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  abgelehnt: { label: "Abgelehnt", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-mono text-xs uppercase tracking-wider", config.className)}>
      {config.label}
    </Badge>
  );
}
