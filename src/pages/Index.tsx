import { useState, useCallback, memo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { DealCard } from "@/components/DealCard";
import { LeadDetail } from "@/components/LeadDetail";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CalendarView } from "@/components/CalendarView";
import { Users, CheckCircle, TrendingUp, Zap, LayoutGrid, Columns3, CalendarDays } from "lucide-react";

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-mono text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
});

type ViewMode = "grid" | "kanban" | "calendar";

export default function Index() {
  const { data: leads = [], isLoading } = useLeads();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("kanban");

  const neu = leads.filter((l) => l.status === "neu").length;
  const qualifiziert = leads.filter((l) => l.status === "qualifiziert").length;
  const hoch = leads.filter((l) => l.dringlichkeit === "hoch").length;

  const handleSelect = useCallback(
    (id: string) => setSelectedId((prev) => (prev === id ? null : id)),
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">
              <span className="text-primary">Handly</span> Lead-Engine
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">24/7 Automated Qualification</p>
          </div>
          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
              <button
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors ${
                  view === "kanban"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setView("kanban")}
              >
                <Columns3 className="h-3.5 w-3.5" />
                Tickets
              </button>
              <button
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors ${
                  view === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors ${
                  view === "calendar"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setView("calendar")}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Kalender
              </button>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs text-muted-foreground font-mono">LIVE</span>
            </div>
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
              <StatCard icon={CheckCircle} label="Qualified" value={String(qualifiziert)} accent />
              <StatCard icon={Zap} label="New Leads" value={String(neu)} />
              <StatCard icon={TrendingUp} label="Urgent" value={String(hoch)} />
            </div>

            {/* Content area */}
            <div>
              {view === "kanban" && (
                <>
                  <h2 className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-4">
                    Ticket Board ({leads.length})
                  </h2>

                  {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                          <div className="h-10 bg-muted rounded-lg animate-pulse" />
                          <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoading && leads.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-12 text-center">
                      <Columns3 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">No tickets yet.</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        When a customer messages via WhatsApp, their ticket will appear here.
                      </p>
                    </div>
                  )}

                  {!isLoading && leads.length > 0 && (
                    <KanbanBoard leads={leads} onSelectLead={handleSelect} />
                  )}
                </>
              )}

              {view === "grid" && (
                <>
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
                      <p className="text-muted-foreground text-sm">No leads yet.</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        When a customer messages via WhatsApp, their Deal Card will appear here.
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
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {view === "calendar" && (
                <>
                  <h2 className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-4">
                    Terminkalender
                  </h2>

                  {isLoading && (
                    <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
                      <div className="h-8 bg-muted rounded w-1/3 mb-4" />
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }, (_, i) => (
                          <div key={i} className="h-16 bg-muted/50 rounded" />
                        ))}
                      </div>
                    </div>
                  )}

                  {!isLoading && <CalendarView leads={leads} onSelectLead={handleSelect} />}
                </>
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
