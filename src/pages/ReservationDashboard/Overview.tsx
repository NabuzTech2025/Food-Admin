import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Pencil, Phone, StickyNote, CalendarClock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useReservationConfig,
  useReservationStoreId,
  useTodayReservations,
  useAvailability,
  useUpdateReservation,
} from "@/hooks/useReservationV2";
import type { ReservationV2 } from "@/api/reservationV2";

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
  const editDuration = (r: ReservationV2) => {
    const val = window.prompt("Duration in minutes", String(r.duration_minutes));
    if (!val) return;
    const minutes = Number(val);
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    updateRes.mutate({ id: r.id, payload: { duration_minutes: minutes } });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between rounded-xl bg-component-bg border border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Owner Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEE, d MMMM yyyy")}
          </p>
        </div>
        {config && (
          <Badge
            className={config.enabled ? "bg-green-600 text-white" : ""}
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
              <Stat label="Max Party Size">{config?.max_party_size ?? "—"}</Stat>
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
            <h2 className="font-semibold text-foreground">Covers Filled Today</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Cap: {config?.max_covers ?? "—"} covers per slot
            </p>
            <CoversChart slots={availability?.slots ?? []} />
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
                {active.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full flex items-center gap-3 py-3 text-left rounded-lg px-2 transition-colors ${
                      selected?.id === r.id ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
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
                          onClick={() => editDuration(r)}
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
                    {fmtTime(selected.reserved_until)} ({selected.duration_minutes}{" "}
                    min)
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
                    onClick={() => editDuration(selected)}
                  >
                    Edit Duration
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
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

// Bars: covers filled per slot (total − available), colored by fill ratio.
function CoversChart({
  slots,
}: {
  slots: { time: string; available: number; total: number }[];
}) {
  if (slots.length === 0)
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No slots for today.
      </p>
    );
  return (
    <div className="flex items-end gap-1.5 h-40 overflow-x-auto">
      {slots.map((s) => {
        const filled = Math.max(s.total - s.available, 0);
        const ratio = s.total ? filled / s.total : 0;
        const color =
          ratio >= 1
            ? "bg-red-500"
            : ratio >= 0.85
              ? "bg-amber-500"
              : "bg-green-600";
        return (
          <div
            key={s.time}
            className="flex-1 min-w-9 flex flex-col items-center justify-end h-full gap-1"
          >
            <span className="text-xs font-medium text-foreground">{filled}</span>
            <div
              className={`w-full rounded-t ${color}`}
              style={{ height: `${Math.max(ratio * 100, 3)}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{s.time}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Overview;
