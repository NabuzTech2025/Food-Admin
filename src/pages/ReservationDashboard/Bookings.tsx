import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useFilterReservations,
  useReservationStoreId,
  useUpdateReservation,
} from "@/hooks/useReservationV2";

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

function Bookings() {
  const storeId = useReservationStoreId();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: reservations = [], isLoading } = useFilterReservations(
    storeId ? { store_id: storeId, target_date: date, limit: 200 } : null,
  );
  const update = useUpdateReservation();

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            All reservations for the selected day.
          </p>
        </div>
        <label className="flex items-center gap-2 bg-component-bg border border-border rounded-lg px-3 py-1.5">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-none shadow-none h-8 w-auto p-0 focus-visible:ring-0"
          />
        </label>
      </div>

      <div className="rounded-xl bg-component-bg border border-border overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase">
          <span className="col-span-2">Time</span>
          <span className="col-span-3">Guest</span>
          <span className="col-span-2 hidden sm:block">Party</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-3 text-right">Actions</span>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            Loading…
          </p>
        ) : reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No reservations on this day.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm"
              >
                <span className="col-span-2 font-semibold text-foreground">
                  {fmtTime(r.reserved_for)}
                </span>
                <span className="col-span-3 min-w-0 truncate">
                  <span className="font-medium text-foreground">
                    {r.customer_name || "Guest"}
                  </span>
                  {r.customer_phone && (
                    <span className="block text-xs text-muted-foreground truncate">
                      {r.customer_phone}
                    </span>
                  )}
                </span>
                <span className="col-span-2 hidden sm:block text-muted-foreground">
                  {r.party_size} guests
                </span>
                <span className="col-span-2">{statusBadge(r.status)}</span>
                <span className="col-span-3 flex justify-end gap-1.5">
                  {r.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white h-8"
                        disabled={update.isPending}
                        onClick={() =>
                          update.mutate({
                            id: r.id,
                            payload: { status: "booked" },
                          })
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8"
                        disabled={update.isPending}
                        onClick={() =>
                          update.mutate({
                            id: r.id,
                            payload: { status: "cancelled" },
                          })
                        }
                      >
                        Decline
                      </Button>
                    </>
                  ) : r.status === "booked" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: r.id,
                          payload: { status: "cancelled" },
                        })
                      }
                    >
                      Cancel
                    </Button>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
