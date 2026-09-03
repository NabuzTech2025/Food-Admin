import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Search,
  SlidersHorizontal,
  CalendarDays,
  Clock,
  Users,
  ChevronRight,
  Check,
  X,
  User,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useFilterBookings,
  useBookingStoreId,
  useUpdateBooking,
} from "@/hooks/useBookingV2";
import type { BookingV2 } from "@/api/bookingV2";
import EditBookingDialog from "./EditBookingDialog";

const tabs = ["All", "Pending", "Accepted", "Declined"] as const;
type Tab = (typeof tabs)[number];

// tab -> booking status
const tabStatus: Record<Exclude<Tab, "All">, BookingV2["status"]> = {
  Pending: "pending",
  Accepted: "booked",
  Declined: "cancelled",
};

const statusBadge = (status: BookingV2["status"]) => {
  if (status === "booked") return <Badge className="bg-green-600 text-white">Accepted</Badge>;
  if (status === "pending") return <Badge className="bg-amber-500 text-white">Pending</Badge>;
  return <Badge className="bg-destructive text-white">Declined</Badge>;
};

function BookingCard({
  b,
  onAccept,
  onDecline,
  onOpen,
  onEdit,
  isUpdating,
}: {
  b: BookingV2;
  onAccept: (b: BookingV2) => void;
  onDecline: (b: BookingV2) => void;
  onOpen: (b: BookingV2) => void;
  onEdit: (b: BookingV2) => void;
  isUpdating: boolean;
}) {
  return (
    <div
      onClick={() => onOpen(b)}
      className="rounded-xl bg-component-bg border border-border p-5 space-y-4 cursor-pointer hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{b.customer_name || "Guest"}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{b.reference}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusBadge(b.status)}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(b);
            }}
            className="text-muted-foreground hover:text-primary"
            aria-label="Edit booking"
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <span className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
          <User size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">
            {b.customer_phone || "—"}
          </p>
          {b.customer_email && (
            <p className="text-sm text-muted-foreground truncate">{b.customer_email}</p>
          )}
        </div>
        <ChevronRight size={18} className="text-muted-foreground shrink-0" />
      </div>

      <div className="flex items-center gap-5 border-t border-border pt-4 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={15} className="text-primary" /> {format(parseISO(b.start_at), "dd MMM yyyy")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={15} className="text-primary" /> {format(parseISO(b.start_at), "hh:mm a")}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Users size={15} className="text-primary" /> {b.party_size}
        </span>
      </div>

      {b.status === "pending" && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              onDecline(b);
            }}
          >
            <X className="w-4 h-4" /> Decline
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              onAccept(b);
            }}
          >
            <Check className="w-4 h-4" /> Accept
          </Button>
        </div>
      )}
    </div>
  );
}

const money = (n: number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency === "STR" ? "GBP" : currency,
  }).format(n);

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right break-words">{children}</span>
    </div>
  );
}

function BookingDetailDialog({
  booking,
  onClose,
  onEdit,
}: {
  booking: BookingV2 | null;
  onClose: () => void;
  onEdit: (b: BookingV2) => void;
}) {
  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        {booking && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <DialogTitle>{booking.customer_name || "Guest"}</DialogTitle>
                {statusBadge(booking.status)}
              </div>
              <p className="text-xs text-muted-foreground">{booking.reference}</p>
            </DialogHeader>

            <div className="mt-2">
              <DetailRow label="Date">{format(parseISO(booking.start_at), "EEE, dd MMM yyyy")}</DetailRow>
              <DetailRow label="Time">
                {format(parseISO(booking.start_at), "hh:mm a")} – {format(parseISO(booking.end_at), "hh:mm a")}
                <span className="text-muted-foreground font-normal"> · {booking.duration_minutes} min</span>
              </DetailRow>
              <DetailRow label="Guests">{booking.party_size}</DetailRow>
              <DetailRow label="Units">{booking.units}</DetailRow>
              <DetailRow label="Phone">{booking.customer_phone || "—"}</DetailRow>
              <DetailRow label="Email">{booking.customer_email || "—"}</DetailRow>
              <DetailRow label="Payment">
                <span className="capitalize">{booking.payment_status}</span>
              </DetailRow>
              {booking.price_total != null && (
                <DetailRow label="Total">{money(booking.price_total, booking.currency)}</DetailRow>
              )}
              {booking.deposit_amount != null && (
                <DetailRow label="Deposit">{money(booking.deposit_amount, booking.currency)}</DetailRow>
              )}
              {booking.note && <DetailRow label="Note">{booking.note}</DetailRow>}
              <DetailRow label="Created">{format(parseISO(booking.created_at), "dd MMM yyyy, hh:mm a")}</DetailRow>
            </div>

            {booking.form_data && Object.keys(booking.form_data).length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-foreground mb-1">Additional Details</p>
                {Object.entries(booking.form_data).map(([k, v]) => (
                  <DetailRow key={k} label={k.replace(/_/g, " ")}>
                    {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
                  </DetailRow>
                ))}
              </div>
            )}

            <DialogFooter className="mt-5">
              <Button onClick={() => onEdit(booking)}>
                <Pencil className="w-4 h-4" /> Edit Booking
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Bookings() {
  const storeId = useBookingStoreId();
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<BookingV2 | null>(null);
  const [editing, setEditing] = useState<BookingV2 | null>(null);

  // applied date filter
  const [targetDate, setTargetDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: bookings = [], isLoading } = useFilterBookings(storeId, targetDate);
  const updateBooking = useUpdateBooking();

  const accept = (b: BookingV2) =>
    updateBooking.mutate({ id: b.id, payload: { status: "booked" } });
  const decline = (b: BookingV2) =>
    updateBooking.mutate({ id: b.id, payload: { status: "cancelled" } });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter(
      (b) =>
        (tab === "All" || b.status === tabStatus[tab]) &&
        (!q ||
          (b.customer_name ?? "").toLowerCase().includes(q) ||
          (b.customer_phone ?? "").toLowerCase().includes(q) ||
          b.reference.toLowerCase().includes(q))
    );
  }, [bookings, tab, query]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search booking or customer"
            className="pl-10"
          />
        </div>
        <Button
          variant="default"
          size="icon"
          onClick={() => setFilterOpen(true)}
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
              tab === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-component-bg text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">
          {format(parseISO(targetDate), "dd MMM yyyy").toUpperCase()}
        </p>
        {isLoading ? (
          <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
            No bookings found.
          </div>
        ) : (
          filtered.map((b) => (
            <BookingCard
              key={b.id}
              b={b}
              onAccept={accept}
              onDecline={decline}
              onOpen={setSelected}
              onEdit={setEditing}
              isUpdating={updateBooking.isPending}
            />
          ))
        )}
      </div>

      {/* Filter modal — pick a date to filter immediately */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Filter Bookings</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={parseISO(targetDate)}
            onSelect={(d) => {
              if (!d) return;
              setTargetDate(format(d, "yyyy-MM-dd"));
              setFilterOpen(false);
            }}
            autoFocus
          />
        </DialogContent>
      </Dialog>

      {/* Booking detail */}
      <BookingDetailDialog
        booking={selected}
        onClose={() => setSelected(null)}
        onEdit={(b) => {
          setSelected(null);
          setEditing(b);
        }}
      />

      {/* Edit booking */}
      <EditBookingDialog booking={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

export default Bookings;
