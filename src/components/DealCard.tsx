import { Lead } from "@/types/lead";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, MessageCircle, Phone, MapPin, Home, Ruler, Banknote, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";

function DataRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="font-mono text-sm text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

const urgencyColors = {
  hoch: "text-destructive",
  mittel: "text-primary",
  niedrig: "text-muted-foreground",
};

const urgencyLabels = {
  hoch: "Hoch",
  mittel: "Mittel",
  niedrig: "Niedrig",
};

const kanalIcons = {
  whatsapp: MessageCircle,
  sms: MessageSquare,
};

export function DealCard({ lead }: { lead: Lead }) {
  const KanalIcon = kanalIcons[lead.kanal];
  const zeit = new Date(lead.erstelltAm).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <Card className="border-border/60 bg-card hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate">{lead.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <KanalIcon className="h-3 w-3" />
              <span>{zeit}</span>
            </div>
          </div>
          <StatusBadge status={lead.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="grid grid-cols-2 gap-3">
          <DataRow icon={Home} label="Dachtyp" value={lead.dachtyp} />
          <DataRow icon={Ruler} label="Fläche" value={`${lead.flaeche_qm} m²`} />
          <DataRow icon={Banknote} label="Budget" value={lead.budget} />
          <DataRow icon={MapPin} label="Adresse" value={lead.adresse} />
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Dringlichkeit:</span>
          <span className={`font-mono text-sm font-semibold ${urgencyColors[lead.dringlichkeit]}`}>
            {urgencyLabels[lead.dringlichkeit]}
          </span>
        </div>

        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">KI-Zusammenfassung</p>
          <p className="text-sm leading-relaxed">{lead.zusammenfassung}</p>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button
          className="flex-1"
          onClick={() => toast.success(`Besuch bei ${lead.name} geplant`)}
        >
          <CalendarCheck className="mr-1.5 h-4 w-4" />
          Besuch planen
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => toast.info(`Anruf an ${lead.telefon}`)}
        >
          <Phone className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
