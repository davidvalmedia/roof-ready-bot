import { useState, useMemo } from "react";
import { Lead } from "@/types/lead";
import { ChevronLeft, ChevronRight, Clock, MapPin, Phone, Home } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface CalendarViewProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function isToday(year: number, month: number, day: number) {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

type ViewMode = "month" | "week";

export function CalendarView({ leads, onSelectLead }: CalendarViewProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [calendarView, setCalendarView] = useState<ViewMode>("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Leads with appointments
  const appointments = useMemo(() => {
    return leads
      .filter((l) => l.termin)
      .map((l) => ({ ...l, terminDate: new Date(l.termin!) }))
      .sort((a, b) => a.terminDate.getTime() - b.terminDate.getTime());
  }, [leads]);

  // Group appointments by date string
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, typeof appointments>();
    for (const a of appointments) {
      const key = `${a.terminDate.getFullYear()}-${a.terminDate.getMonth()}-${a.terminDate.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [appointments]);

  function getAppointmentsForDay(y: number, m: number, d: number) {
    return appointmentsByDate.get(`${y}-${m}-${d}`) || [];
  }

  // Navigation
  function prev() {
    if (calendarView === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    }
  }
  function next() {
    if (calendarView === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    }
  }
  function goToday() {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  // Week view helpers
  function getWeekDays() {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }

  // Upcoming appointments (next 7 days)
  const upcoming = useMemo(() => {
    const now = new Date();
    const weekOut = new Date(now.getTime() + 7 * 86400000);
    return appointments.filter((a) => a.terminDate >= now && a.terminDate <= weekOut);
  }, [appointments]);

  // Stats
  const totalAppointments = appointments.length;
  const thisMonthAppointments = appointments.filter(
    (a) => a.terminDate.getMonth() === month && a.terminDate.getFullYear() === year
  ).length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Termine gesamt</span>
          <p className="font-mono text-xl font-bold text-foreground">{totalAppointments}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Diesen Monat</span>
          <p className="font-mono text-xl font-bold text-primary">{thisMonthAppointments}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Nächste 7 Tage</span>
          <p className="font-mono text-xl font-bold text-emerald-500">{upcoming.length}</p>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Calendar */}
        <div className="flex-1 rounded-lg border border-border bg-card">
          {/* Calendar header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <h3 className="font-mono text-sm font-semibold">
                {calendarView === "month"
                  ? `${MONTHS[month]} ${year}`
                  : (() => {
                      const days = getWeekDays();
                      const start = days[0];
                      const end = days[6];
                      return `${start.getDate()}. ${MONTHS[start.getMonth()].slice(0, 3)} – ${end.getDate()}. ${MONTHS[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
                    })()}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={prev}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={goToday}
                  className="rounded-md px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Heute
                </button>
                <button
                  onClick={next}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center rounded-md border border-border bg-background p-0.5">
              <button
                className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                  calendarView === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setCalendarView("month")}
              >
                Monat
              </button>
              <button
                className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                  calendarView === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setCalendarView("week")}
              >
                Woche
              </button>
            </div>
          </div>

          {/* Month view */}
          {calendarView === "month" && (
            <div className="p-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-mono text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7">
                {(() => {
                  const firstDay = getFirstDayOfMonth(year, month);
                  const daysInMonth = getDaysInMonth(year, month);
                  const daysInPrevMonth = getDaysInMonth(year, month - 1);
                  const cells: React.ReactNode[] = [];

                  // Previous month padding
                  for (let i = firstDay - 1; i >= 0; i--) {
                    const d = daysInPrevMonth - i;
                    cells.push(
                      <div key={`prev-${d}`} className="min-h-[80px] border border-border/30 p-1 opacity-30">
                        <span className="text-[11px] font-mono text-muted-foreground">{d}</span>
                      </div>
                    );
                  }

                  // Current month
                  for (let d = 1; d <= daysInMonth; d++) {
                    const dayAppts = getAppointmentsForDay(year, month, d);
                    const todayClass = isToday(year, month, d) ? "bg-primary/5 border-primary/30" : "border-border/30";
                    cells.push(
                      <div key={d} className={`min-h-[80px] border ${todayClass} p-1`}>
                        <span
                          className={`text-[11px] font-mono inline-flex items-center justify-center w-5 h-5 rounded-full ${
                            isToday(year, month, d) ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                          }`}
                        >
                          {d}
                        </span>
                        <div className="mt-0.5 space-y-0.5">
                          {dayAppts.slice(0, 2).map((a) => (
                            <button
                              key={a.id}
                              onClick={() => onSelectLead(a.id)}
                              className="w-full text-left rounded px-1 py-0.5 text-[10px] truncate bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-colors cursor-pointer"
                            >
                              <span className="font-mono">{formatTime(a.terminDate)}</span>{" "}
                              {a.name || a.telefon}
                            </button>
                          ))}
                          {dayAppts.length > 2 && (
                            <span className="text-[10px] text-muted-foreground pl-1">
                              +{dayAppts.length - 2} mehr
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Next month padding
                  const totalCells = cells.length;
                  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                  for (let d = 1; d <= remaining; d++) {
                    cells.push(
                      <div key={`next-${d}`} className="min-h-[80px] border border-border/30 p-1 opacity-30">
                        <span className="text-[11px] font-mono text-muted-foreground">{d}</span>
                      </div>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>
          )}

          {/* Week view */}
          {calendarView === "week" && (
            <div className="p-3">
              <div className="space-y-1">
                {getWeekDays().map((date) => {
                  const dayAppts = getAppointmentsForDay(date.getFullYear(), date.getMonth(), date.getDate());
                  const todayMatch = isSameDay(date, today);
                  return (
                    <div
                      key={date.toISOString()}
                      className={`flex gap-3 rounded-lg p-3 ${todayMatch ? "bg-primary/5 border border-primary/20" : "border border-transparent hover:bg-muted/30"}`}
                    >
                      <div className="w-16 shrink-0 text-center">
                        <div className="text-[11px] font-mono text-muted-foreground uppercase">
                          {WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                        </div>
                        <div
                          className={`text-lg font-mono font-bold ${
                            todayMatch ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {dayAppts.length === 0 && (
                          <p className="text-[11px] text-muted-foreground/50 py-2">Keine Termine</p>
                        )}
                        <div className="space-y-1.5">
                          {dayAppts.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => onSelectLead(a.id)}
                              className="w-full text-left flex items-start gap-3 rounded-md border border-violet-500/20 bg-violet-500/5 p-2.5 hover:bg-violet-500/10 transition-colors cursor-pointer"
                            >
                              <div className="shrink-0 text-center rounded bg-violet-500/20 px-2 py-1">
                                <span className="font-mono text-sm font-semibold text-violet-400">
                                  {formatTime(a.terminDate)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground truncate">
                                    {a.name || "Unbekannt"}
                                  </span>
                                  <StatusBadge status={a.status} />
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                                  {a.adresse && (
                                    <span className="flex items-center gap-1 truncate">
                                      <MapPin className="h-3 w-3" /> {a.adresse}
                                    </span>
                                  )}
                                  {a.dachtyp && (
                                    <span className="flex items-center gap-1">
                                      <Home className="h-3 w-3" /> {a.dachtyp}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming sidebar */}
        <div className="w-64 shrink-0 space-y-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <h4 className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-3">
              Nächste Termine
            </h4>
            {upcoming.length === 0 && (
              <p className="text-xs text-muted-foreground/50 py-4 text-center">Keine anstehenden Termine</p>
            )}
            <div className="space-y-2">
              {upcoming.slice(0, 8).map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectLead(a.id)}
                  className="w-full text-left rounded-md p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <Clock className="h-3 w-3 text-violet-400" />
                    <span className="font-mono text-[11px] text-violet-400">
                      {a.terminDate.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}{" "}
                      {formatTime(a.terminDate)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate pl-5">
                    {a.name || "Unbekannt"}
                  </p>
                  {a.adresse && (
                    <p className="text-[11px] text-muted-foreground truncate pl-5">{a.adresse}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Leads without appointments */}
          {(() => {
            const unscheduled = leads.filter(
              (l) => !l.termin && (l.status === "qualifiziert" || l.status === "neu")
            );
            if (unscheduled.length === 0) return null;
            return (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <h4 className="font-mono text-[11px] text-amber-500 uppercase tracking-wider mb-2">
                  Ohne Termin ({unscheduled.length})
                </h4>
                <div className="space-y-1.5">
                  {unscheduled.slice(0, 5).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onSelectLead(l.id)}
                      className="w-full text-left rounded-md p-1.5 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-amber-500/60" />
                        <span className="text-xs text-foreground truncate">{l.name || l.telefon}</span>
                      </div>
                    </button>
                  ))}
                  {unscheduled.length > 5 && (
                    <p className="text-[10px] text-muted-foreground pl-5">+{unscheduled.length - 5} weitere</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
