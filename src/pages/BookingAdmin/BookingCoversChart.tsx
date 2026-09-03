import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Clock, Users, CheckCircle2, Clock as ClockIcon, XCircle } from "lucide-react";
import type { BookingV2 } from "@/api/bookingV2";
import { getContrastText } from "@/components/Forms/Reservations/ReservationTooltip";

// ponytail: per-slot capacity isn't in the /today payload; constant until a service config API exists
const CAP = 10;
const SLOT_MINUTES = 30;
const START_HOUR = 7;
const END_HOUR = 24;

// Validated categorical palette (same as the reservation covers chart).
const SERIES_COLORS = [
  "#2a78d6", "#1baf7a", "#eda100", "#008300",
  "#4a3aa7", "#e34948", "#e87ba4", "#eb6834",
];
const colorFor = (i: number) => (i < SERIES_COLORS.length ? SERIES_COLORS[i] : "#898781");

const fmt = (iso: string) => format(parseISO(iso), "HH:mm");

// Build 30-min slots for the day as wall-clock minutes-of-day.
const buildSlots = () => {
  const out: { label: string; minutes: number }[] = [];
  for (let m = START_HOUR * 60; m < END_HOUR * 60; m += SLOT_MINUTES) {
    const h = Math.floor(m / 60);
    out.push({ label: `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`, minutes: m });
  }
  return out;
};

const minutesOfDay = (iso: string) => {
  const d = parseISO(iso);
  return d.getHours() * 60 + d.getMinutes();
};

function Tooltip({ x, y, b, color }: { x: number; y: number; b: BookingV2; color: string }) {
  const textColor = getContrastText(color);
  const StatusIcon = b.status === "cancelled" ? XCircle : b.status === "pending" ? ClockIcon : CheckCircle2;
  const iconProps = { className: "h-[18px] w-[18px]", style: { color: textColor } };
  const Row = ({ icon, children, divider }: { icon: React.ReactNode; children: React.ReactNode; divider?: boolean }) => (
    <>
      <div style={{ backgroundColor: color }} className="flex min-h-[52px] items-center gap-3 rounded-xl px-4 py-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <span className="text-[17px] font-semibold" style={{ color: textColor }}>{children}</span>
      </div>
      {divider && <div className="ml-12 border-t" style={{ borderColor: `${color}25` }} />}
    </>
  );
  return (
    <div
      className="fixed z-[9999] w-[340px] rounded-2xl border p-5 shadow-xl pointer-events-none"
      style={{ left: x + 16, top: y, transform: "translateY(-60%)", backgroundColor: `${color}10`, borderColor: color }}
    >
      <div style={{ backgroundColor: color }} className="mb-4 flex items-center justify-between rounded-xl px-4 py-2">
        <p className="truncate text-xl font-semibold pl-2" style={{ color: textColor }}>
          {b.customer_name || "Guest"}
        </p>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
          <CalendarDays className="h-5 w-5" style={{ color: textColor }} />
        </div>
      </div>
      <Row icon={<Clock {...iconProps} />} divider>
        {fmt(b.start_at)} – {fmt(b.end_at)}
        <span className="normal-case opacity-80"> • {b.duration_minutes} min</span>
      </Row>
      <Row icon={<Users {...iconProps} />} divider>{b.party_size} guests</Row>
      <Row icon={<StatusIcon {...iconProps} />}>{b.status === "booked" ? "Booked" : b.status}</Row>
    </div>
  );
}

function BookingCoversChart({ bookings }: { bookings: BookingV2[] }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; b: BookingV2 } | null>(null);

  // Only bookings that hold covers (exclude cancelled).
  const active = bookings.filter((b) => b.status !== "cancelled");

  if (active.length === 0)
    return <p className="text-sm text-muted-foreground py-6 text-center">No bookings for today.</p>;

  const slots = buildSlots();

  const enter = (b: BookingV2, e: React.MouseEvent) => {
    setHoveredId(b.id);
    setTip({ x: e.clientX, y: e.clientY, b });
  };
  const leave = () => {
    setHoveredId(null);
    setTip(null);
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">Cap: {CAP} covers per slot</p>

      <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-1">
        {slots.map((s) => {
          const here = active.filter(
            (b) => minutesOfDay(b.start_at) <= s.minutes && s.minutes < minutesOfDay(b.end_at),
          );
          const filled = here.reduce((sum, b) => sum + b.party_size, 0);
          const barPct = Math.min(filled / CAP, 1) * 100;
          return (
            <div key={s.label} className="flex-1 min-w-9 flex flex-col items-center justify-end h-full gap-1">
              <span className="text-xs font-medium text-foreground">{filled}</span>
              <div
                className="w-full rounded-t overflow-hidden flex flex-col gap-0.5"
                style={{ height: `${Math.max(barPct, filled ? 3 : 0)}%` }}
              >
                {here.map((b) => (
                  <div
                    key={b.id}
                    className="w-full cursor-pointer transition-opacity"
                    style={{
                      flexGrow: b.party_size,
                      backgroundColor: colorFor(active.findIndex((x) => x.id === b.id)),
                      opacity: hoveredId != null && hoveredId !== b.id ? 0.25 : 1,
                    }}
                    onMouseEnter={(e) => enter(b, e)}
                    onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, b })}
                    onMouseLeave={leave}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
        {active.map((b, i) => (
          <span
            key={b.id}
            className="flex items-center gap-1.5 text-xs cursor-default transition-opacity"
            style={{ opacity: hoveredId != null && hoveredId !== b.id ? 0.4 : 1 }}
            onMouseEnter={() => setHoveredId(b.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: colorFor(i) }} />
            <span className="text-foreground">{b.customer_name || "Guest"}</span>
            <span className="text-muted-foreground">{fmt(b.start_at)}</span>
          </span>
        ))}
      </div>

      {tip && <Tooltip x={tip.x} y={tip.y} b={tip.b} color={colorFor(active.findIndex((x) => x.id === tip.b.id))} />}
    </div>
  );
}

export default BookingCoversChart;
