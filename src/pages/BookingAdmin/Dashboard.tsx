import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  PoundSterling,
  Users,
  Plus,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTodayBookings, useBookingStoreId } from "@/hooks/useBookingV2";
import type { BookingV2 } from "@/api/bookingV2";
import BookingCoversChart from "./BookingCoversChart";
import EditBookingDialog from "./EditBookingDialog";

const statusBadge = (status: BookingV2["status"]) => {
  if (status === "booked") return <Badge className="bg-green-600 text-white">Accepted</Badge>;
  if (status === "pending") return <Badge className="bg-amber-500 text-white">Pending</Badge>;
  return <Badge className="bg-destructive text-white">Declined</Badge>;
};

const money = (n: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency === "STR" ? "GBP" : currency }).format(n);

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl bg-component-bg border border-border p-5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
      <span className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
        <Icon size={18} />
      </span>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useTodayBookings(useBookingStoreId());
  const [editing, setEditing] = useState<BookingV2 | null>(null);

  const s = data?.summary;
  const currency = data?.bookings[0]?.currency ?? "GBP";
  const stats = [
    { label: "Total Bookings", value: String(s?.total ?? 0), icon: CalendarDays },
    { label: "Pending", value: String(s?.pending ?? 0), icon: Clock },
    { label: "Accepted", value: String(s?.booked ?? 0), icon: CheckCircle2 },
    { label: "Declined", value: String(s?.cancelled ?? 0), icon: XCircle },
    { label: "Revenue (Accepted)", value: money(s?.revenue_booked ?? 0, currency), icon: PoundSterling },
    { label: "Total Guests", value: String(s?.guests ?? 0), icon: Users },
  ];
  const schedule = data?.bookings ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 flex-wrap rounded-xl bg-component-bg border border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bookings Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEE, d MMMM yyyy")}
          </p>
        </div>
        <Button onClick={() => navigate("../create")}>
          <Plus className="w-4 h-4" /> Create Booking
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Booking overview chart */}
        <section className="lg:col-span-2 rounded-xl bg-component-bg border border-border p-5">
          <h2 className="font-semibold text-foreground mb-1">Booking Overview</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : (
            <BookingCoversChart bookings={schedule} />
          )}
        </section>

        {/* Today's schedule */}
        <section className="rounded-xl bg-component-bg border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-foreground">Today's Schedule</h2>
            <button
              onClick={() => navigate("../bookings")}
              className="text-primary font-medium text-sm hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
            ) : schedule.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No bookings today.</p>
            ) : (
              schedule.map((b) => (
                <div key={b.id} className="flex items-center gap-3 py-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {format(parseISO(b.start_at), "hh:mm a")}
                  </span>
                  <span className="w-px self-stretch bg-border" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {b.customer_name || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {b.reference} · {b.party_size} Guests
                    </p>
                  </div>
                  {statusBadge(b.status)}
                  <button
                    onClick={() => setEditing(b)}
                    className="text-muted-foreground hover:text-primary shrink-0"
                    aria-label="Edit booking"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Edit booking */}
      <EditBookingDialog booking={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

export default Dashboard;
