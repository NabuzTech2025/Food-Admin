import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  Clock3,
  Menu,
  ChevronLeft,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
import { getSuperAdminReservations } from "../../api/reservation";
import type {
  ReservationsResponse,
  ReservationItem,
} from "../../api/reservation";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { ReservationDetailModal } from "./ReservationDetailModal";

interface FlattenedReservation {
  storeName: string;
  storeId: number;
  res: ReservationItem;
}

const Reservation = () => {
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<ReservationsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getSuperAdminReservations(date);
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to fetch reservations");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [date]);

  const setToday = () => {
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return (
          <Badge className="bg-primary text-primary-foreground">BOOKED</Badge>
        );
      case "pending":
        return <Badge variant="secondary">PENDING</Badge>;
      case "cancelled":
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  // Flatten all reservations from stores to show in a single list
  const allReservations = React.useMemo(() => {
    if (!data) return [];
    const list: FlattenedReservation[] = [];
    data.stores.forEach((store) => {
      if (selectedStoreId === null || selectedStoreId === store.store_id) {
        store.reservations.forEach((res) => {
          list.push({
            storeName: store.store_name,
            storeId: store.store_id,
            res,
          });
        });
      }
    });
    // Sort by created_at descending
    return list.sort(
      (a, b) =>
        new Date(b.res.created_at).getTime() -
        new Date(a.res.created_at).getTime(),
    );
  }, [data, selectedStoreId]);

  return (
    <div className="py-6 space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full hidden md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
            <p className="text-muted-foreground text-sm">
              View and manage store reservations
            </p>
          </div>
        </div>

        {/* Stats and Date Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1.5 text-sm">
            Total: {data?.total || 0}
          </Badge>

          <label
            className="flex items-center gap-2 bg-card p-1 rounded-md border shadow-sm cursor-pointer"
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input");
              if (input && "showPicker" in input) {
                try {
                  input.showPicker();
                } catch (e) {}
              }
            }}
          >
            <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 h-8 w-auto bg-transparent cursor-pointer"
            />
          </label>

          <Button onClick={setToday} variant="default" className="h-10">
            Today
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Horizontal scrollable store list */}
          {data.stores.length > 0 && (
            <div className="flex overflow-x-auto pb-4 gap-5 scrollbar-hide snap-x">
              {data.stores.map((store) => (
                <Card
                  key={store.store_id}
                  onClick={() =>
                    setSelectedStoreId(
                      selectedStoreId === store.store_id
                        ? null
                        : store.store_id,
                    )
                  }
                  className={`min-w-[280px] cursor-pointer transition-all snap-start ${
                    selectedStoreId === store.store_id
                      ? "ring-2 ring-primary border-primary shadow-md"
                      : "hover:border-primary/50"
                  }`}
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium mb-2 flex justify-between">
                        <span>ID: {store.store_id}</span>
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xl">
                        {store.store_name}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t flex justify-between text-base">
                      <span className="text-muted-foreground">
                        Total:{" "}
                        <strong className="text-foreground">
                          {store.total}
                        </strong>
                      </span>
                      <span className="text-muted-foreground">
                        Booked:{" "}
                        <strong className="text-foreground">
                          {store.booked}
                        </strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Subheader */}
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-medium">
              {selectedStoreId ? "Store Reservations" : "All Reservations"}
            </h2>
            <span className="text-muted-foreground text-base">
              {allReservations.length} total
            </span>
          </div>

          {/* Reservations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            {allReservations.map(({ storeName, storeId, res }) => (
              <Card
                key={`${storeId}-${res.id}`}
                onClick={() => setSelectedDetailId(res.id)}
                className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Top Section */}
                  <div className="p-5 bg-muted/20 border-b">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <UserRound className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">
                            {res.customer_name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Store className="w-3.5 h-3.5" /> {storeName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                          <Clock3 className="w-4 h-4" />
                          <span>
                            {format(new Date(res.created_at), "h:mm a")}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          #{res.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Details Section */}
                  <div className="p-5 flex-1 space-y-5">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-base">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          Contact
                        </span>
                        <span className="font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          {res.customer_phone || "-"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-xs text-muted-foreground">
                          Status
                        </span>
                        {getStatusBadge(res.status)}
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          Date & Time
                        </span>
                        <span className="font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {format(
                            new Date(res.reserved_for),
                            "dd MMM yy, h:mm a",
                          )}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-xs text-muted-foreground">
                          Party Size
                        </span>
                        <span className="font-medium flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          {res.guest_count} guests
                        </span>
                      </div>
                    </div>

                    {/* Note Section */}
                    {res.note && (
                      <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex gap-2 items-start mt-2">
                        <Menu className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="line-clamp-2">{res.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="p-5 pt-0 mt-auto">
                    <Button
                      variant="default"
                      className="w-full font-semibold h-11 text-base"
                    >
                      Vorbestellen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {allReservations.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-card/50">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No reservations found</h3>
                <p className="text-muted-foreground">
                  Try selecting a different date or store.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      <ReservationDetailModal
        reservationId={selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
      />
    </div>
  );
};

export default Reservation;
