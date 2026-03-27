import { mockLeads } from "@/data/mockLeads";
import { DealCard } from "@/components/DealCard";
import { Users, CheckCircle, TrendingUp, Zap } from "lucide-react";

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-mono text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

const Index = () => {
  const neu = mockLeads.filter(l => l.status === "neu").length;
  const qualifiziert = mockLeads.filter(l => l.status === "qualifiziert").length;
  const hoch = mockLeads.filter(l => l.dringlichkeit === "hoch").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">
              <span className="text-primary">Handly</span> Lead-Engine
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">24/7 Automatische Qualifizierung</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <span className="text-xs text-muted-foreground font-mono">LIVE</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Leads heute" value={String(mockLeads.length)} />
          <StatCard icon={CheckCircle} label="Qualifiziert" value={String(qualifiziert)} accent />
          <StatCard icon={Zap} label="Neue Leads" value={String(neu)} />
          <StatCard icon={TrendingUp} label="Dringend" value={String(hoch)} />
        </div>

        {/* Deal Cards */}
        <div>
          <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Deal Cards ({mockLeads.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockLeads.map(lead => (
              <DealCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
