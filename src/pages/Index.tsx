import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { DealCard } from "@/components/DealCard";
import { LeadDetail } from "@/components/LeadDetail";
import { Users, CheckCircle, TrendingUp, Zap } from "lucide-react";

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-mono text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

export default function Index() {
  const { data: leads = [], isLoading } = useLeads();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const neu = leads.filter((l) => l.status === "neu").length;
  const qualifiziert = leads.filter((l) => l.status === "qualifiziert").length;
  const hoch = leads.filter((l) => l.dringlichkeit === "hoch").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">
              <span className="text-primary">Handly</span> Lead-Engine
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">24/7 Automatische Qualifizierung</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-muted-foreground font-mono">LIVE</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex gap-6">
          {/* Dashboard */}
          <div className={`space-y-6 ${selectedId ? "flex-1 min-w-0" : "w-full"}`}>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Leads" value={String(leads.length)} />
              <StatCard icon={CheckCircle} label="Qualifiziert" value={String(qualifiziert)} accent />
              <StatCard icon={Zap} label="Neue Leads" value={String(neu)} />
              <StatCard icon={TrendingUp} label="Dringend" value={String(hoch)} />
            </div>

            {/* Deal Cards */}
            <div>
              <h2 className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-4">
                Deal Cards ({leads.length})
              </h2>

              {isLoading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-6 animate-pulse">
                      <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                      <div className="h-3 bg-muted rounded w-1/3 mb-4" />
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && leads.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">Noch keine Leads.</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Sobald ein Kunde über WhatsApp schreibt, erscheint hier die Deal Card.
                  </p>
                </div>
              )}

              {!isLoading && leads.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {leads.map((lead) => (
                    <DealCard
                      key={lead.id}
                      lead={lead}
                      selected={lead.id === selectedId}
                      onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lead Detail Panel */}
          {selectedId && (
            <div className="w-[400px] shrink-0 h-[calc(100vh-8rem)] sticky top-6">
              <LeadDetail id={selectedId} onClose={() => setSelectedId(null)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
