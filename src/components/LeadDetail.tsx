import { memo, useState } from "react";
import { useLead, useUpdateLead, useAskLead } from "@/hooks/useLeads";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck, Phone, X, MapPin, Home, Ruler, Banknote,
  Clock, MessageCircle, MessageSquare, ChevronDown, ChevronUp,
  User, FileText, AlertTriangle, CheckCircle2, Sun, Zap, Calendar,
  Send, Image, Loader2,
} from "lucide-react";

const urgencyConfig = {
  hoch: { label: "Urgent", className: "text-red-400 bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  mittel: { label: "Medium", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
  niedrig: { label: "Low", className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", icon: CheckCircle2 },
} as const;

const kanalLabels = { whatsapp: "WhatsApp", sms: "SMS" };
const kanalIcons = { whatsapp: MessageCircle, sms: MessageSquare };

function DetailField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-mono mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export const LeadDetail = memo(function LeadDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const askLead = useAskLead();
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState("");
  const [lastSent, setLastSent] = useState<string | null>(null);

  const handleAsk = () => {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setLastSent(null);
    askLead.mutate({ id, question: q }, {
      onSuccess: (data) => {
        setLastSent(data.message);
      },
    });
  };

  if (isLoading || !lead) {
    return (
      <Card className="h-full border-border/60 animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-5 bg-muted rounded w-1/2 mb-3" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-muted/50 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const KanalIcon = kanalIcons[lead.kanal];
  const urgency = lead.dringlichkeit ? urgencyConfig[lead.dringlichkeit] : null;
  const UrgencyIcon = urgency ? urgency.icon : null;
  const messageCount = lead.messages.length;
  const isQualified = lead.status === "qualifiziert";
  const isNew = lead.status === "neu";

  return (
    <Card className="flex flex-col h-full border-border/60 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-border shrink-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg truncate">{lead.name || "New Contact"}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={lead.status} />
              {urgency && UrgencyIcon && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${urgency.className}`}>
                  <UrgencyIcon className="h-3 w-3" />
                  {urgency.label}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Scrollable body */}
      <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
        {/* AI Summary */}
        {lead.zusammenfassung && (
          <div className="px-4 py-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-[11px] text-primary uppercase tracking-wider font-semibold">AI Summary</p>
            </div>
            <p className="text-sm leading-relaxed">{lead.zusammenfassung}</p>
          </div>
        )}

        {/* Still qualifying */}
        {!lead.zusammenfassung && isNew && (
          <div className="px-4 py-6 border-b border-border text-center">
            <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">AI is qualifying this lead...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{messageCount} messages so far</p>
          </div>
        )}

        {/* Appointment */}
        {lead.termin && (
          <div className="px-4 py-3 border-b border-border bg-violet-500/5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-400" />
              <p className="text-[11px] text-violet-400 uppercase tracking-wider font-semibold">Consultation Booked</p>
            </div>
            <p className="text-sm font-mono mt-1">{lead.termin}</p>
          </div>
        )}

        {/* Roof details */}
        <div className="px-4 py-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Roof Details</p>
          <div>
            <DetailField icon={Home} label="Roof Type" value={lead.dachtyp} />
            <DetailField icon={Ruler} label="Area" value={lead.flaeche_qm ? `${lead.flaeche_qm} m²` : null} />
            <DetailField icon={Clock} label="Roof Age" value={lead.dach_alter} />
            <DetailField icon={AlertTriangle} label="Condition" value={lead.zustand_notizen} />
            <DetailField icon={Banknote} label="Budget" value={lead.budget} />
            <DetailField icon={MapPin} label="Address" value={lead.adresse} />
          </div>

          {!lead.dachtyp && !lead.flaeche_qm && !lead.budget && !lead.adresse && (
            <p className="text-xs text-muted-foreground/60 py-3 text-center">
              Details being collected...
            </p>
          )}
        </div>

        {/* Additional info */}
        {(lead.energieberater || lead.photovoltaik || lead.entscheidungstraeger) && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Additional Info</p>
            <DetailField icon={Sun} label="Energy Consultant" value={
              lead.energieberater === "ja" ? "Yes" : lead.energieberater === "nein" ? "No" : lead.energieberater === "unbekannt" ? "Unknown" : null
            } />
            <DetailField icon={Zap} label="Photovoltaics" value={
              lead.photovoltaik === "ja" ? "Yes" : lead.photovoltaik === "nein" ? "No" : lead.photovoltaik === "unbekannt" ? "Unknown" : null
            } />
            <DetailField icon={User} label="Decision Maker" value={lead.entscheidungstraeger} />
          </div>
        )}

        {/* Photos from customer */}
        {(() => {
          const photos = lead.messages.filter((m) => m.media_url && m.media_type?.startsWith("image/"));
          if (photos.length === 0) return null;
          return (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Photos ({photos.length})</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <a key={p.id} href={p.media_url!} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={p.media_url!}
                      alt="Customer photo"
                      className="rounded-md border border-border w-full h-20 object-cover hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Contact info */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">{lead.telefon}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <KanalIcon className="h-3 w-3" />
              <span>{kanalLabels[lead.kanal]}</span>
            </div>
          </div>
        </div>

        {/* Chat transcript */}
        <div className="border-t border-border">
          <button
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors"
            onClick={() => setShowChat(!showChat)}
          >
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Chat History ({messageCount})
            </span>
            {showChat ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showChat && (
            <div className="px-4 pb-4 space-y-2 max-h-[300px] overflow-y-auto">
              {lead.messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
              )}
              {lead.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "lead" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "lead"
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.media_url && msg.media_type?.startsWith("image/") && (
                      <img src={msg.media_url} alt="Photo" className="rounded-md mb-1.5 max-w-full" />
                    )}
                    {msg.content.replace(/<qualification_complete>[\s\S]*?<\/qualification_complete>/, "").replace(/<lead_update>[\s\S]*?<\/lead_update>/, "").trim()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Sticky bottom: follow-up question + actions */}
      <div className="shrink-0 border-t border-border bg-card">
        {/* Follow-up question input */}
        <div className="px-3 pt-3 pb-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Ask follow-up via WhatsApp</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="e.g. Can you send roof photos?"
              className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={askLead.isPending}
            />
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={handleAsk}
              disabled={askLead.isPending || !question.trim()}
            >
              {askLead.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {askLead.isPending && (
            <p className="text-[10px] text-muted-foreground mt-1.5">AI is rephrasing & sending...</p>
          )}
          {lastSent && !askLead.isPending && (
            <div className="mt-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5">
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">Sent to customer:</p>
              <p className="text-xs text-emerald-300/90 leading-relaxed">{lastSent}</p>
            </div>
          )}
          {askLead.isError && (
            <p className="text-[10px] text-red-400 mt-1.5">Failed to send — try again</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-3 pb-3 flex gap-2">
          {isQualified && (
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
            className={isQualified ? "" : "flex-1"}
            onClick={() => window.open(`tel:${lead.telefon}`)}
          >
            <Phone className="mr-1.5 h-4 w-4" />
            Call
          </Button>
        </div>
      </div>
    </Card>
  );
});
