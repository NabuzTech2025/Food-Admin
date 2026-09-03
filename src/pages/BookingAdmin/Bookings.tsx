import { useMemo, useState } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Status = "Accepted" | "Pending" | "Declined";

// ponytail: static demo data; wire to booking API when the endpoint exists
type Booking = {
  id: string;
  title: string;
  customer: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: Status;
};

const bookings: Booking[] = [
  { id: "BK-10245", title: "Premier League", customer: "Sarah Ahmed", phone: "+44 7700 900123", date: "02 Sep 2026", time: "10:00 AM", guests: 8, status: "Accepted" },
  { id: "BK-10246", title: "Champions League", customer: "John Smith", phone: "+44 7700 900456", date: "02 Sep 2026", time: "12:30 PM", guests: 6, status: "Pending" },
  { id: "BK-10247", title: "World Cup", customer: "Michael Brown", phone: "+44 7700 900789", date: "02 Sep 2026", time: "03:00 PM", guests: 10, status: "Accepted" },
];

const tabs = ["All", "Pending", "Accepted", "Declined"] as const;

const statusBadge = (status: Status) => {
  const map: Record<Status, string> = {
    Accepted: "bg-green-600 text-white",
    Pending: "bg-amber-500 text-white",
    Declined: "bg-destructive text-white",
  };
  return <Badge className={map[status]}>{status}</Badge>;
};

function BookingCard({ b }: { b: Booking }) {
  return (
    <div className="rounded-xl bg-component-bg border border-border p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{b.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{b.id}</p>
        </div>
        {statusBadge(b.status)}
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <span className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
          <User size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">{b.customer}</p>
          <p className="text-sm text-muted-foreground truncate">{b.phone}</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground shrink-0" />
      </div>

      <div className="flex items-center gap-5 border-t border-border pt-4 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={15} className="text-primary" /> {b.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={15} className="text-primary" /> {b.time}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Users size={15} className="text-primary" /> {b.guests}
        </span>
      </div>

      {b.status === "Pending" && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            <X className="w-4 h-4" /> Decline
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Check className="w-4 h-4" /> Accept
          </Button>
        </div>
      )}
    </div>
  );
}

function Bookings() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter(
      (b) =>
        (tab === "All" || b.status === tab) &&
        (!q ||
          b.title.toLowerCase().includes(q) ||
          b.customer.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q))
    );
  }, [tab, query]);

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
        <Button variant="default" size="icon" onClick={() => setFilterOpen(true)} aria-label="Filter">
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
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">TODAY</p>
        {filtered.length === 0 ? (
          <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
            No bookings found.
          </div>
        ) : (
          filtered.map((b) => <BookingCard key={b.id} b={b} />)
        )}
      </div>

      {/* Filter modal */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Bookings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" /> Date
              </Label>
              <DatePicker value="" onChange={() => {}} placeholder="Select booking date" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" /> Service
              </Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premier">Premier League</SelectItem>
                  <SelectItem value="champions">Champions League</SelectItem>
                  <SelectItem value="worldcup">World Cup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Users size={16} className="text-primary" /> Guests
              </Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any number of guests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-4">1 - 4</SelectItem>
                  <SelectItem value="5-8">5 - 8</SelectItem>
                  <SelectItem value="9+">9+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setFilterOpen(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Bookings;
