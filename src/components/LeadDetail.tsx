import { useLead, useUpdateLead } from "@/hooks/useLeads";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Phone, X, Bot, User, MapPin, Home, Ruler, Banknote, Clock, MessageCircle, MessageSquare } from "lucide-react";

const urgencyConfig = {
  hoch: { label: "Urgent", className: "text-red-400" },
  mittel: { label: "Medium", className: "text-amber-400" },
  niedrig: { label: "Low", className: "text-zinc-400" },
} as const;

const kanalIcons = { whatsapp: MessageCircle, sms: MessageSquare };

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-sm font-mono truncate">{value}</span>
    </div>
  );
}

export function LeadDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();

  if (isLoading || !lead) {
    return (
      <Card className="h-full border-border/60 animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-5 bg-muted rounded w-1/2" />
        </CardHeader>
      </Card>
    );
  }

  const KanalIcon = kanalIcons[lead.kanal];
  const urgency = lead.dringlichkeit ? urgencyConfig[lead.dringlichkeit] : null;

  return (
    <Card className="flex flex-col h-full border-border/60">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate">{lead.name || lead.telefon}</h3>
            <div className="flex items-center gap-2 mt-1">
              <KanalIcon className="h-3 w-3 text-muted-foreground" />
              <StatusBadge status={lead.status} />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Lead info */}
        <div className="space-y-1.5 mt-3">
          <InfoRow icon={Phone} label="Phone" value={lead.telefon} />
          <InfoRow icon={Home} label="Roof Type" value={lead.dachtyp} />
          <InfoRow icon={Ruler} label="Area" value={lead.flaeche_qm ? `${lead.flaeche_qm} m²` : null} />
          <InfoRow icon={Banknote} label="Budget" value={lead.budget} />
          <InfoRow icon={MapPin} label="Address" value={lead.adresse} />
          {urgency && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">Urgency:</span>
              <span className={`text-sm font-mono font-semibold ${urgency.className}`}>{urgency.label}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        {lead.zusammenfassung && (
          <div className="rounded-md bg-muted/50 p-3 mt-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">AI Summary</p>
            <p className="text-sm leading-relaxed">{lead.zusammenfassung}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {lead.status === "qualifiziert" && (
            <Button
              className="flex-1"
              size="sm"
              onClick={() => updateLead.mutate({ id: lead.id, status: "termin_geplant" })}
            >
              <CalendarCheck className="mr-1.5 h-4 w-4" />
              Schedule Visit
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(`tel:${lead.telefon}`)}
          >
            <Phone className="mr-1.5 h-4 w-4" />
            Call
          </Button>
        </div>
      </CardHeader>

      {/* Conversation */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Conversation History</p>

        {lead.messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
        )}

        {lead.messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "lead" ? "justify-end" : "justify-start"}`}>
            {msg.role === "agent" && (
              <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "lead"
                  ? "bg-emerald-600 text-white rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {msg.content.replace(/<qualification_complete>[\s\S]*?<\/qualification_complete>/, "").trim()}
            </div>
            {msg.role === "lead" && (
              <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-600/20 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
