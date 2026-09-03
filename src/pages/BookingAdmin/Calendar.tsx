import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Users,
  ChevronRight as Chevron,
  CalendarCheck,
  Utensils,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "Accepted" | "Pending";

// ponytail: static demo data; wire to booking API when the endpoint exists
type Booking = {
  date: string; // yyyy-MM-dd
  customer: string;
  type: string;
  time: string;
  guests: number;
  status: Status;
};

const bookings: Booking[] = [
  { date: "2026-09-02", customer: "John Smith", type: "Table Reservation", time: "06:30 PM", guests: 4, status: "Pending" },
  { date: "2026-09-02", customer: "Sarah Ahmed", type: "Private Event", time: "08:00 PM", guests: 12, status: "Accepted" },
  { date: "2026-09-05", customer: "Emma Wilson", type: "Table Reservation", time: "07:00 PM", guests: 2, status: "Pending" },
  { date: "2026-09-08", customer: "James Lee", type: "Table Reservation", time: "01:00 PM", guests: 5, status: "Pending" },
  { date: "2026-09-12", customer: "David Johnson", type: "Private Event", time: "08:30 PM", guests: 20, status: "Accepted" },
  { date: "2026-09-12", customer: "Olivia Martin", type: "Table Reservation", time: "06:00 PM", guests: 6, status: "Pending" },
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusBadge = (status: Status) =>
  status === "Accepted" ? (
    <Badge className="bg-green-600 text-white">Accepted</Badge>
  ) : (
    <Badge className="bg-amber-500 text-white">Pending</Badge>
  );

function Calendar() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(startOfMonth(new Date("2026-09-01")));
  const [selected, setSelected] = useState("2026-09-12");

  // group bookings by day for dot markers + the selected-day list
  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      map.set(b.date, [...(map.get(b.date) ?? []), b]);
    }
    return map;
  }, []);

  const days = useMemo(() => {
    const first = startOfMonth(month);
    const grid = eachDayOfInterval({ start: first, end: endOfMonth(month) });
    const lead = (getDay(first) + 6) % 7; // Monday-first offset
    return { grid, lead };
  }, [month]);

  const selectedBookings = byDate.get(selected) ?? [];
  const today = new Date();

  const stats = [
    { label: "Total", value: bookings.length, icon: CalendarDays, tint: "bg-primary-light text-primary" },
    { label: "Pending", value: bookings.filter((b) => b.status === "Pending").length, icon: Clock, tint: "bg-amber-50 text-amber-500" },
    { label: "Accepted", value: bookings.filter((b) => b.status === "Accepted").length, icon: CalendarCheck, tint: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-component-bg border border-border p-4 flex flex-col items-center gap-2">
            <span className={cn("w-10 h-10 rounded-full flex items-center justify-center", s.tint)}>
              <s.icon size={18} />
            </span>
            <span className="text-2xl font-bold text-foreground">{s.value}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="rounded-xl bg-component-bg border border-border p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMonth((m) => addMonths(m, -1))} className="text-primary p-1">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-bold text-foreground">{format(month, "MMMM yyyy")}</h2>
          <button onClick={() => setMonth((m) => addMonths(m, 1))} className="text-primary p-1">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-2">
          {weekdays.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: days.lead }).map((_, i) => (
            <span key={`lead-${i}`} />
          ))}
          {days.grid.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayBookings = byDate.get(key) ?? [];
            const isSelected = key === selected;
            const isToday = isSameDay(day, today) && isSameMonth(day, month);
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className="flex flex-col items-center gap-1 py-1"
              >
                <span
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "bg-primary-light text-primary"
                        : "text-foreground hover:bg-muted"
                  )}
                >
                  {format(day, "d")}
                </span>
                <span className="flex gap-0.5 h-1.5">
                  {dayBookings.slice(0, 3).map((b, i) => (
                    <span
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        b.status === "Accepted" ? "bg-green-600" : "bg-amber-500"
                      )}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day bookings */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {format(parseISO(selected), "d MMMM yyyy")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedBookings.length} booking{selectedBookings.length === 1 ? "" : "s"} scheduled
          </p>
        </div>
        <span className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-semibold">
          {selectedBookings.length}
        </span>
      </div>

      <div className="space-y-4">
        {selectedBookings.length === 0 ? (
          <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
            No bookings on this day.
          </div>
        ) : (
          selectedBookings.map((b, i) => (
            <div key={i} className="rounded-xl bg-component-bg border border-border p-4 flex items-center gap-4">
              <span
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                  b.type === "Private Event" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-500"
                )}
              >
                {b.type === "Private Event" ? <CalendarCheck size={20} /> : <Utensils size={20} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{b.customer}</p>
                <p className="text-sm text-muted-foreground truncate">{b.type}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" /> {b.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-primary" /> {b.guests}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {statusBadge(b.status)}
                <Chevron size={18} className="text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        className="fixed bottom-6 right-6 z-20 rounded-full shadow-lg h-12 px-5"
        onClick={() => navigate("../create")}
      >
        <Plus className="w-4 h-4" /> New Booking
      </Button>
    </div>
  );
}

export default Calendar;
