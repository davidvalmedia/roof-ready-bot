import { memo, useCallback } from "react";
import type { Lead, LeadStatus } from "@/types/lead";
import { StatusBadge } from "@/components/StatusBadge";
import { useUpdateLead } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import {
  Phone, CalendarCheck, Home, Ruler, Banknote, MapPin,
  Clock, MessageCircle, MessageSquare, ChevronRight,
  XCircle, AlertTriangle, CheckCircle2, Calendar,
} from "lucide-react";

const columns: { status: LeadStatus; label: string; color: string }[] = [
  { status: "neu", label: "New", color: "border-blue-500/40" },
  { status: "qualifiziert", label: "Qualified", color: "border-emerald-500/40" },
  { status: "termin_geplant", label: "Scheduled", color: "border-violet-500/40" },
  { status: "abgelehnt", label: "Rejected", color: "border-zinc-500/40" },
];

const urgencyConfig = {
  hoch: { label: "Dringend", className: "text-red-400 bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  mittel: { label: "Mittel", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
  niedrig: { label: "Niedrig", className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", icon: CheckCircle2 },
} as const;

const kanalIcons = { whatsapp: MessageCircle, sms: MessageSquare };

const nextStatus: Partial<Record<LeadStatus, { status: LeadStatus; label: string; icon: React.ElementType }>> = {
  neu: { status: "qualifiziert", label: "Qualifizieren", icon: ChevronRight },
  qualifiziert: { status: "termin_geplant", label: "Termin planen", icon: CalendarCheck },
};

const TicketCard = memo(function TicketCard({
  lead,
  onSelect,
  onMove,
  onReject,
}: {
  lead: Lead;
  onSelect: (id: string) => void;
  onMove: (id: string, status: LeadStatus) => void;
  onReject: (id: string) => void;
}) {
  const KanalIcon = kanalIcons[lead.kanal];
  const urgency = lead.dringlichkeit ? urgencyConfig[lead.dringlichkeit] : null;
  const UrgencyIcon = urgency ? urgency.icon : null;
  const next = nextStatus[lead.status];
  const hasDetails = lead.dachtyp || lead.flaeche_qm || lead.budget || lead.adresse;

  return (
    <div
      className="rounded-lg border border-border/60 bg-card hover:border-primary/40 transition-colors cursor-pointer"
      onClick={() => onSelect(lead.id)}
    >
      {/* Header: Name + urgency */}
      <div className="flex items-start justify-between gap-2 p-3 pb-0">
        <div className="min-w-0">
          <h4 className="font-semibold text-sm truncate">{lead.name || lead.telefon}</h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
            <KanalIcon className="h-3 w-3" />
            <span>
              {new Date(lead.created_at).toLocaleString("de-DE", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        {urgency && UrgencyIcon && (
          <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full border ${urgency.className}`}>
            <UrgencyIcon className="h-2.5 w-2.5" />
            {urgency.label}
          </span>
        )}
      </div>

      {/* Deal details — the meat of the card */}
      <div className="px-3 py-2">
        {hasDetails ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {lead.dachtyp && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <Home className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate">{lead.dachtyp}</span>
              </div>
            )}
            {lead.flaeche_qm && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <Ruler className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{lead.flaeche_qm} m²</span>
              </div>
            )}
            {lead.budget && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <Banknote className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate">{lead.budget}</span>
              </div>
            )}
            {lead.adresse && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate">{lead.adresse}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-1">
            <Clock className="h-3 w-3 animate-pulse" />
            <span>KI qualifiziert...</span>
          </div>
        )}
      </div>

      {/* Appointment indicator */}
      {lead.termin && (
        <div className="px-3 pb-1">
          <div className="flex items-center gap-1.5 text-[11px] text-violet-400 bg-violet-500/10 rounded-md px-2 py-1">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.termin}</span>
          </div>
        </div>
      )}

      {/* Summary — 2-line max preview */}
      {lead.zusammenfassung && (
        <div className="px-3 pb-2">
          <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 bg-muted/30 rounded-md px-2 py-1.5">
            {lead.zusammenfassung}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border/40">
        {next && (
          <Button
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onMove(lead.id, next.status);
            }}
          >
            <next.icon className="mr-1 h-3 w-3" />
            {next.label}
          </Button>
        )}
        {lead.status !== "abgelehnt" && lead.status !== "termin_geplant" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onReject(lead.id);
            }}
          >
            <XCircle className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 ml-auto shrink-0 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`tel:${lead.telefon}`);
          }}
        >
          <Phone className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});

export const KanbanBoard = memo(function KanbanBoard({
  leads,
  onSelectLead,
}: {
  leads: Lead[];
  onSelectLead: (id: string) => void;
}) {
  const updateLead = useUpdateLead();

  const handleMove = useCallback(
    (id: string, status: LeadStatus) => {
      updateLead.mutate({ id, status });
    },
    [updateLead]
  );

  const handleReject = useCallback(
    (id: string) => {
      updateLead.mutate({ id, status: "abgelehnt" });
    },
    [updateLead]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.status);
        return (
          <div key={col.status} className="space-y-3">
            {/* Column header */}
            <div className={`flex items-center justify-between rounded-lg border-t-2 ${col.color} bg-card/50 px-3 py-2`}>
              <StatusBadge status={col.status} />
              <span className="font-mono text-xs text-muted-foreground">{colLeads.length}</span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[120px]">
              {colLeads.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/40 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Keine Tickets</p>
                </div>
              )}
              {colLeads.map((lead) => (
                <TicketCard
                  key={lead.id}
                  lead={lead}
                  onSelect={onSelectLead}
                  onMove={handleMove}
                  onReject={handleReject}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});
