import { Calendar, ChevronLeft, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSuperAdminReceivedTodayV2 } from "@/hooks/useReservationV2";

const ReservationV2 = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSuperAdminReceivedTodayV2();

  return (
    <div className="py-6 space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full hidden md:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reservations (v2)
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {data?.date ?? "Today"}'s covers-based bookings, received today across all stores
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!!error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          Failed to load reservations
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Totals across all stores */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
              Stores: {data.store_count}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
              Total: {data.totals.total}
            </Badge>
            <Badge className="bg-primary text-primary-foreground px-3 py-1.5 text-sm">
              Booked: {data.totals.booked}
            </Badge>
            <Badge className="px-3 py-1.5 text-sm">
              Pending: {data.totals.pending}
            </Badge>
            <Badge variant="destructive" className="px-3 py-1.5 text-sm">
              Cancelled: {data.totals.cancelled}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {data.stores.map((store) => (
              <Card
                key={store.store_id}
                onClick={() =>
                  navigate(
                    `/super/stores/${store.store_id}/reservation-dashboard/overview`,
                  )
                }
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" /> ID: {store.store_id}
                      </p>
                      <h3 className="font-bold text-lg">{store.store_name}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xl font-semibold">
                        {store.summary.total}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-primary">
                        {store.summary.booked}
                      </p>
                      <p className="text-xs text-muted-foreground">Booked</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold">
                        {store.summary.pending}
                      </p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-between text-sm text-muted-foreground">
                    <span>
                      Covers:{" "}
                      <strong className="text-foreground">
                        {store.summary.active_covers}
                      </strong>
                    </span>
                    {store.summary.next_upcoming_date && (
                      <span>
                        Next:{" "}
                        <strong className="text-foreground">
                          {store.summary.next_upcoming_date}
                        </strong>
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {data.stores.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-card/50">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No reservations found</h3>
                <p className="text-muted-foreground">
                  No stores have received bookings today.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationV2;
