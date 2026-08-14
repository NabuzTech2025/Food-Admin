import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Pencil,
  Phone,
  StickyNote,
  CalendarClock,
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EditReservationDialog from "@/components/Forms/Reservations/EditReservationForm";
import {
  useReservationConfig,
  useReservationStoreId,
  useTodayReservations,
  useAvailability,
  useUpdateReservation,
} from "@/hooks/useReservationV2";
import type { ReservationV2 } from "@/api/reservationV2";
import ReservationTooltip from "@/components/Forms/Reservations/ReservationTooltip";

const fmtTime = (iso: string) => format(new Date(iso), "HH:mm");

const statusBadge = (status: string) => {
  switch (status) {
    case "booked":
      return <Badge className="bg-green-600 text-white">Booked</Badge>;
    case "pending":
      return <Badge className="bg-amber-500 text-white">Pending</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function Overview() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const storeId = useReservationStoreId();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: config } = useReservationConfig(storeId);
  const { data: reservations = [], isLoading } = useTodayReservations(storeId);
  const { data: availability } = useAvailability(storeId, today, 2);
  const updateRes = useUpdateReservation();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ReservationV2 | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const active = reservations.filter((r) => r.status !== "cancelled");
  const covers = useMemo(() => {
    const booked = active
      .filter((r) => r.status === "booked")
      .reduce((s, r) => s + r.party_size, 0);
    const pending = active
      .filter((r) => r.status === "pending")
      .reduce((s, r) => s + r.party_size, 0);
    const capacity = config?.max_covers ?? 0;
    const available = Math.max(capacity - booked - pending, 0);
    return { booked, pending, available, capacity };
  }, [active, config]);

  const selected =
    active.find((r) => r.id === selectedId) ??
    active.find((r) => r.status === "pending") ??
    active[0] ??
    null;

  const accept = (r: ReservationV2) =>
    updateRes.mutate({ id: r.id, payload: { status: "booked" } });
  const decline = (r: ReservationV2) =>
    updateRes.mutate({ id: r.id, payload: { status: "cancelled" } });

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 flex-wrap rounded-xl bg-component-bg border border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Owner Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEE, d MMMM yyyy")}
          </p>
        </div>
        {config && (
          <Badge
            className={`shrink-0 ${config.enabled ? "bg-green-600 text-white" : ""}`}
            variant={config.enabled ? "default" : "secondary"}
          >
            Reservations {config.enabled ? "ON" : "OFF"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Reservation settings */}
          <section className="rounded-xl bg-component-bg border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                Reservation Settings
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ pathname: "../settings", search })}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Reservations">
                <span
                  className={
                    config?.enabled ? "text-green-600" : "text-muted-foreground"
                  }
                >
                  {config?.enabled ? "ON" : "OFF"}
                </span>
              </Stat>
              <Stat label="Max Covers">{config?.max_covers ?? "—"}</Stat>
              <Stat label="Slot Interval">
                {config ? `${config.slot_interval_minutes} min` : "—"}
              </Stat>
              <Stat label="Default Duration">
                {config ? `${config.default_duration_minutes} min` : "—"}
              </Stat>
              <Stat label="Max Party Size">
                {config?.max_party_size ?? "—"}
              </Stat>
              <Stat label="Lead Time">
                {config ? `${config.lead_time_minutes} min` : "—"}
              </Stat>
              <Stat label="Booking Window">
                {config ? `${config.booking_window_days} days` : "—"}
              </Stat>
            </div>
          </section>

          {/* Covers filled today */}
          <section className="rounded-xl bg-component-bg border border-border p-5">
            <h2 className="font-semibold text-foreground">
              Covers Filled Today
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Cap: {config?.max_covers ?? "—"} covers per slot
            </p>
            <CoversChart
              slots={availability?.slots ?? []}
              reservations={active}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          </section>

          {/* Today's bookings */}
          <section className="rounded-xl bg-component-bg border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">
              Today's Bookings
            </h2>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Loading…
              </p>
            ) : active.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No bookings today.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {active.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    onMouseEnter={() => setHoveredId(r.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`w-full flex items-center gap-3 py-3 text-left rounded-lg px-2 transition-colors ${
                      hoveredId !== r.id && selected?.id === r.id
                        ? "bg-muted"
                        : ""
                    }`}
                    style={
                      hoveredId === r.id
                        ? { backgroundColor: `${colorFor(i)}22` }
                        : undefined
                    }
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: colorFor(i) }}
                    />
                    <span className="font-semibold text-foreground w-14 shrink-0">
                      {fmtTime(r.reserved_for)}
                    </span>
                    <span className="flex-1 min-w-0 truncate font-medium text-foreground">
                      {r.customer_name || "Guest"}
                    </span>
                    <span className="text-sm text-muted-foreground w-20 shrink-0 hidden sm:block">
                      {r.party_size} guests
                    </span>
                    <span className="text-sm text-muted-foreground w-16 shrink-0 hidden md:block">
                      {r.duration_minutes} min
                    </span>
                    <span className="shrink-0">{statusBadge(r.status)}</span>
                    <span
                      className="shrink-0 flex gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8"
                            disabled={updateRes.isPending}
                            onClick={() => accept(r)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            disabled={updateRes.isPending}
                            onClick={() => decline(r)}
                          >
                            Decline
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => setEditing(r)}
                        >
                          Edit
                        </Button>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Today's overview donut */}
          <section className="rounded-xl bg-component-bg border border-border p-5">
            <h2 className="font-semibold text-foreground">Today's Overview</h2>
            <p className="text-xs text-muted-foreground mb-4">
              {format(new Date(), "EEE, d MMMM yyyy")}
            </p>
            <div className="flex items-center gap-5">
              <CoversDonut {...covers} />
              <div className="space-y-2 text-sm">
                <Legend color="bg-muted-foreground/30" label="Available">
                  {covers.available}
                </Legend>
                <Legend color="bg-green-600" label="Booked">
                  {covers.booked}
                </Legend>
                <Legend color="bg-amber-500" label="Pending">
                  {covers.pending}
                </Legend>
              </div>
            </div>
          </section>

          {/* Booking details */}
          <section className="rounded-xl bg-component-bg border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">
              Booking Details
            </h2>
            {!selected ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Select a booking to see details.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground">
                    {selected.customer_name || "Guest"} · {selected.party_size}{" "}
                    guests
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <CalendarClock className="w-4 h-4" />
                    {fmtTime(selected.reserved_for)} –{" "}
                    {fmtTime(selected.reserved_until)} (
                    {selected.duration_minutes} min)
                  </p>
                </div>

                <DetailRow label="Status">
                  {statusBadge(selected.status)}
                </DetailRow>
                {selected.customer_phone && (
                  <DetailRow label="Phone">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {selected.customer_phone}
                    </span>
                  </DetailRow>
                )}
                {selected.note && (
                  <DetailRow label="Notes">
                    <span className="flex items-center gap-1.5 text-right">
                      <StickyNote className="w-3.5 h-3.5 shrink-0" />
                      {selected.note}
                    </span>
                  </DetailRow>
                )}

                <div className="space-y-2 pt-2">
                  {selected.status === "pending" && (
                    <>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={updateRes.isPending}
                        onClick={() => accept(selected)}
                      >
                        Accept Booking
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-destructive text-destructive hover:bg-destructive/10"
                        disabled={updateRes.isPending}
                        onClick={() => decline(selected)}
                      >
                        Decline Booking
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setEditing(selected)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {editing && (
        <EditReservationDialog
          key={editing.id}
          reservation={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

const Stat = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-border bg-off-bg p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold text-foreground mt-0.5">{children}</p>
  </div>
);

const Legend = ({
  color,
  label,
  children,
}: {
  color: string;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
    <span className="text-muted-foreground flex-1">{label}</span>
    <span className="font-semibold text-foreground">{children}</span>
  </div>
);

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{children}</span>
  </div>
);

// Donut: SVG ring split into booked / pending / available arcs.
function CoversDonut({
  booked,
  pending,
  available,
  capacity,
}: {
  booked: number;
  pending: number;
  available: number;
  capacity: number;
}) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const total = capacity || 1;
  const bookedLen = (booked / total) * c;
  const pendingLen = (pending / total) * c;
  const reserved = booked + pending;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
      <g transform="rotate(-90 60 60)">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="12"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="12"
          stroke="#16a34a"
          strokeDasharray={`${bookedLen} ${c}`}
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="12"
          stroke="#f59e0b"
          strokeDasharray={`${pendingLen} ${c}`}
          strokeDashoffset={-bookedLen}
        />
      </g>
      <text
        x="60"
        y="56"
        textAnchor="middle"
        className="fill-foreground font-bold"
        fontSize="24"
      >
        {reserved}
      </text>
      <text
        x="60"
        y="74"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize="11"
      >
        / {capacity} covers
      </text>
    </svg>
  );
}

// Validated categorical palette (dataviz reference instance, light mode).
// Hues assigned by booking order so a guest keeps one color across every slot
// their reservation spans. A 9th+ booking folds into "Other" (gray).
const SERIES_COLORS = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#008300",
  "#4a3aa7",
  "#e34948",
  "#e87ba4",
  "#eb6834",
];
const colorFor = (index: number) =>
  index < SERIES_COLORS.length ? SERIES_COLORS[index] : "#898781";

// Soft organic "blob" card outline: a rounded rectangle with big round corners
// and gentle raised-cosine bumps on every edge. Each edge's bump vanishes at its
// ends (sin²(πtn) = 0 at t=0,1) so it meets the corner arcs cleanly. Sampled as a
// polyline for smoothness; corners drawn as quarter-circle arcs.
const W = 256;
const H = 256;
const CR = 40; // corner radius
const AMP = 8; // bump amplitude
const SEG = 20; // samples per edge
const wave = (t: number, n: number) => Math.sin(Math.PI * t * n) ** 2;
const blobPath = () => {
  const x0 = AMP;
  const x1 = W - AMP;
  const y0 = AMP;
  const y1 = H - AMP;
  const f = (v: number) => v.toFixed(1);
  let d = `M ${f(x0 + CR)} ${f(y0)}`;
  // top edge → right (bump up), 2 bumps
  for (let i = 1; i <= SEG; i++) {
    const t = i / SEG;
    d += ` L ${f(x0 + CR + t * (x1 - x0 - 2 * CR))} ${f(y0 - AMP * wave(t, 2))}`;
  }
  d += ` A ${CR} ${CR} 0 0 1 ${f(x1)} ${f(y0 + CR)}`;
  // right edge → down (bump right), 1 bump
  for (let i = 1; i <= SEG; i++) {
    const t = i / SEG;
    d += ` L ${f(x1 + AMP * wave(t, 1))} ${f(y0 + CR + t * (y1 - y0 - 2 * CR))}`;
  }
  d += ` A ${CR} ${CR} 0 0 1 ${f(x1 - CR)} ${f(y1)}`;
  // bottom edge → left (bump down), 2 bumps
  for (let i = 1; i <= SEG; i++) {
    const t = i / SEG;
    d += ` L ${f(x1 - CR - t * (x1 - x0 - 2 * CR))} ${f(y1 + AMP * wave(t, 2))}`;
  }
  d += ` A ${CR} ${CR} 0 0 1 ${f(x0)} ${f(y1 - CR)}`;
  // left edge → up (bump left), 1 bump
  for (let i = 1; i <= SEG; i++) {
    const t = i / SEG;
    d += ` L ${f(x0 - AMP * wave(t, 1))} ${f(y1 - CR - t * (y1 - y0 - 2 * CR))}`;
  }
  d += ` A ${CR} ${CR} 0 0 1 ${f(x0 + CR)} ${f(y0)} Z`;
  return d;
};
const SCALLOP_D = blobPath();

// Stacked bars: one colored segment per reservation, so overlapping bookings
// in the same slot read as distinct guests rather than a single block.
function CoversChart({
  slots,
  reservations,
  hoveredId,
  onHover,
}: {
  slots: { time: string; datetime: string; total: number }[];
  reservations: ReservationV2[];
  hoveredId: number | null;
  onHover: (id: number | null) => void;
}) {
  const [tip, setTip] = useState<{
    x: number;
    y: number;
    r: ReservationV2;
  } | null>(null);

  if (slots.length === 0)
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No slots for today.
      </p>
    );

  const enter = (r: ReservationV2, e: React.MouseEvent) => {
    onHover(r.id);
    setTip({ x: e.clientX, y: e.clientY, r });
  };
  const leave = () => {
    onHover(null);
    setTip(null);
  };

  return (
    <div>
      <div className="flex items-end gap-1.5 h-40 overflow-x-auto">
        {slots.map((s) => {
          // Bookings whose window [reserved_for, reserved_until) covers this slot.
          const t = new Date(s.datetime).getTime();
          const here = reservations.filter(
            (r) =>
              new Date(r.reserved_for).getTime() <= t &&
              t < new Date(r.reserved_until).getTime(),
          );
          const filled = here.reduce((sum, r) => sum + r.party_size, 0);
          const barPct = s.total ? Math.min(filled / s.total, 1) * 100 : 0;
          return (
            <div
              key={s.time}
              className="flex-1 min-w-9 flex flex-col items-center justify-end h-full gap-1"
            >
              <span className="text-xs font-medium text-foreground">
                {filled}
              </span>
              <div
                className="w-full rounded-t overflow-hidden flex flex-col gap-0.5"
                style={{ height: `${Math.max(barPct, filled ? 3 : 0)}%` }}
              >
                {here.map((r) => (
                  <div
                    key={r.id}
                    className="w-full cursor-pointer transition-opacity"
                    style={{
                      flexGrow: r.party_size,
                      backgroundColor: colorFor(
                        reservations.findIndex((x) => x.id === r.id),
                      ),
                      opacity:
                        hoveredId != null && hoveredId !== r.id ? 0.25 : 1,
                    }}
                    onMouseEnter={(e) => enter(r, e)}
                    onMouseMove={(e) =>
                      setTip({ x: e.clientX, y: e.clientY, r })
                    }
                    onMouseLeave={leave}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {s.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend — identity is never color-alone */}
      {reservations.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
          {reservations.map((r, i) => (
            <span
              key={r.id}
              className="flex items-center gap-1.5 text-xs cursor-default transition-opacity"
              style={{
                opacity: hoveredId != null && hoveredId !== r.id ? 0.4 : 1,
              }}
              onMouseEnter={() => onHover(r.id)}
              onMouseLeave={() => onHover(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: colorFor(i) }}
              />
              <span className="text-foreground">
                {r.customer_name || "Guest"}
              </span>
              <span className="text-muted-foreground">
                {fmtTime(r.reserved_for)}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Reusable reservation tooltip */}
      {tip && (
        <ReservationTooltip
          x={tip.x}
          y={tip.y}
          reservation={tip.r}
          color={colorFor(reservations.findIndex((r) => r.id === tip.r.id))}
        />
      )}
    </div>
  );
}

export default Overview;
