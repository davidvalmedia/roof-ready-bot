import type { Lead } from "@/types/lead";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Phone, MapPin, Home, Ruler, Banknote, Clock, MessageCircle, MessageSquare } from "lucide-react";
import { useUpdateLead } from "@/hooks/useLeads";

function DataRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <p className="font-mono text-sm text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

const urgencyConfig = {
  hoch: { label: "Urgent", className: "text-red-400" },
  mittel: { label: "Medium", className: "text-amber-400" },
  niedrig: { label: "Low", className: "text-zinc-400" },
} as const;

const kanalIcons = { whatsapp: MessageCircle, sms: MessageSquare };

export function DealCard({ lead, selected, onSelect }: { lead: Lead; selected?: boolean; onSelect?: (id: string) => void }) {
  const updateLead = useUpdateLead();
  const KanalIcon = kanalIcons[lead.kanal];

  const time = new Date(lead.created_at).toLocaleString("en-US", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  const urgency = lead.dringlichkeit ? urgencyConfig[lead.dringlichkeit] : null;

  return (
    <Card
      className={`border-border/60 bg-card hover:border-primary/40 transition-colors cursor-pointer ${selected ? "border-primary ring-1 ring-primary/30" : ""}`}
      onClick={() => onSelect?.(lead.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate">{lead.name || lead.telefon}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <KanalIcon className="h-3 w-3" />
              <span>{time}</span>
            </div>
          </div>
          <StatusBadge status={lead.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="grid grid-cols-2 gap-3">
          <DataRow icon={Home} label="Roof Type" value={lead.dachtyp} />
          <DataRow icon={Ruler} label="Area" value={lead.flaeche_qm ? `${lead.flaeche_qm} m²` : null} />
          <DataRow icon={Banknote} label="Budget" value={lead.budget} />
          <DataRow icon={MapPin} label="Address" value={lead.adresse} />
        </div>

        {urgency && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Urgency:</span>
            <span className={`font-mono text-sm font-semibold ${urgency.className}`}>{urgency.label}</span>
          </div>
        )}

        {lead.zusammenfassung && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">AI Summary</p>
            <p className="text-sm leading-relaxed">{lead.zusammenfassung}</p>
          </div>
        )}

        {!lead.name && !lead.zusammenfassung && (
          <div className="rounded-md border border-dashed border-border p-3 text-center">
            <p className="text-sm text-muted-foreground">Qualifying...</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        {lead.status === "qualifiziert" && (
          <Button
            className="flex-1"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              updateLead.mutate({ id: lead.id, status: "termin_geplant" });
            }}
          >
            <CalendarCheck className="mr-1.5 h-4 w-4" />
            Schedule Visit
          </Button>
        )}
        {lead.telefon && (
          <Button
            variant="secondary"
            size="icon"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${lead.telefon}`);
            }}
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
