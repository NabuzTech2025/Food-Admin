import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock3,
  UserRound,
  Search,
  CheckCircle2,
  Eye,
  CalendarCheck,
  Utensils,
} from "lucide-react";
import {
  filterStoreReservations,
  getTodayReceivedBookings,
  getReservationDetails,
  type ReservationDetail,
} from "../api/reservation";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useAdminStore } from "../context/store/useAdminStore";

const AdminReservation = () => {
  const store_id = useAdminStore((state) => state.store_id);

  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [activeTab, setActiveTab] = useState("today_booking");
  const [searchQuery, setSearchQuery] = useState("");

  const [data, setData] = useState<ReservationDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<ReservationDetail | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleOpenDetails = async (id: number) => {
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsData(null);
    try {
      const details = await getReservationDetails(id);
      setDetailsData(details);
    } catch (err) {
      console.error("Failed to fetch details", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchReservations = async () => {
    if (!store_id) return;
    try {
      setLoading(true);
      setError(null);
      const payload = {
        store_id: Number(store_id),
        target_date: date,
        limit: 0,
        offset: 0,
      };

      const res =
        activeTab === "today_booking"
          ? await filterStoreReservations(payload)
          : await getTodayReceivedBookings(payload);

      // Sort by created_at descending (recently received on top)
      const sorted = (res || []).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setData(sorted);
    } catch (err: any) {
      setError(err.message || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [date, store_id, activeTab]);

  const setToday = () => {
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  // Filter based on search query
  const filteredData = data.filter((res) => {
    const query = searchQuery.toLowerCase();
    return (
      res.customer_name?.toLowerCase().includes(query) ||
      res.customer_phone?.toLowerCase().includes(query) ||
      res.id.toString().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> BOOKED
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1">
            <Eye className="w-3 h-3" /> PENDING
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-center">
          {error}
        </div>
      );
    }
    if (filteredData.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-muted/20">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No reservations found</h3>
          <p className="text-muted-foreground">
            Try selecting a different date or search term.
          </p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
        {filteredData.map((res) => (
          <Card
            key={res.id}
            className="overflow-hidden hover:shadow-md transition-shadow bg-card cursor-pointer"
            onClick={() => handleOpenDetails(res.id)}
          >
            <CardContent className="p-4 flex flex-col gap-4">
              {/* Top Row: Date and Time */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Utensils className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">
                    {format(new Date(res.reserved_for), "dd-MM-yyyy HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium mt-1">
                  <Clock3 className="w-3.5 h-3.5" />
                  {format(new Date(res.created_at), "HH:mm")}
                </div>
              </div>

              {/* Middle Row: Name/Phone and Order ID */}
              <div className="flex justify-between items-center pl-[40px]">
                <div className="font-medium text-foreground text-sm truncate pr-2">
                  {res.customer_name}
                  {res.customer_phone && (
                    <span className="text-muted-foreground font-normal">
                      /{res.customer_phone}
                    </span>
                  )}
                </div>
                <div className="text-foreground font-medium text-sm whitespace-nowrap">
                  Order ID : {res.id}
                </div>
              </div>

              {/* Bottom Row: Guest Count and Status */}
              <div className="flex justify-between items-center pl-[40px] mt-1">
                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold text-foreground text-base">
                    {res.guest_count}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm capitalize">
                    {res.status}
                  </span>
                  {getStatusBadge(res.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="py-6 space-y-6 w-full px-4 md:px-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your store's table reservations and bookings
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>

          <label
            className="flex items-center gap-2 bg-background p-1 px-3 rounded-md border shadow-sm cursor-pointer h-10"
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input");
              if (input && "showPicker" in input) {
                try {
                  input.showPicker();
                } catch (err) {}
              }
            }}
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 h-8 w-auto bg-transparent cursor-pointer p-0"
            />
          </label>

          <Button onClick={setToday} variant="default" className="h-10">
            Today
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="h-11">
            <TabsTrigger value="today_booking" className="text-sm px-6">
              Today Booking
            </TabsTrigger>
            <TabsTrigger
              value="today_received_booking"
              className="text-sm px-6"
            >
              Today Received Booking
            </TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
            <CalendarCheck className="w-4 h-4" />
            Total Reservations:{" "}
            <span className="text-foreground font-bold">
              {filteredData.length}
            </span>
          </div>
        </div>

        <TabsContent value="today_booking" className="m-0">
          {renderContent()}
        </TabsContent>

        <TabsContent value="today_received_booking" className="m-0">
          {renderContent()}
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-background">
          <DialogHeader className="p-4 border-b bg-muted/20">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Utensils className="w-5 h-5 text-primary" />
              Reservation Details
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4 space-y-6">
            {detailsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : detailsData ? (
              <>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    Order ID: {detailsData.id}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Date:{" "}
                    {format(
                      new Date(detailsData.created_at),
                      "dd-MM-yyyy HH:mm",
                    )}
                  </p>
                </div>

                <div className="space-y-1 border-t border-b py-4">
                  <div className="flex text-sm text-foreground">
                    <span className="w-24 text-muted-foreground font-medium">
                      Customer
                    </span>
                    <span className="font-semibold">
                      : {detailsData.customer_name}
                    </span>
                  </div>
                  <div className="flex text-sm text-foreground">
                    <span className="w-24 text-muted-foreground font-medium">
                      Phone
                    </span>
                    <span className="font-semibold">
                      : {detailsData.customer_phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex text-sm text-foreground">
                    <span className="w-24 text-muted-foreground font-medium">
                      Guest
                    </span>
                    <span className="font-semibold">
                      : {detailsData.guest_count}
                    </span>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex text-sm text-foreground items-center justify-between">
                    <span className="text-muted-foreground font-medium">
                      Reservation Date:
                    </span>
                    <span className="font-semibold">
                      {format(
                        new Date(detailsData.reserved_for),
                        "dd-MM-yyyy HH:mm",
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex text-sm text-foreground pb-4">
                  <span className="w-16 text-muted-foreground font-medium">
                    Note:
                  </span>
                  <span className="flex-1 font-medium italic">
                    {detailsData.note || "No notes"}
                  </span>
                </div>

                <div className="flex justify-center pt-2">
                  <div
                    className={`px-8 py-2.5 rounded-full font-bold text-white uppercase tracking-wider text-sm ${detailsData.status === "booked" ? "bg-green-500" : detailsData.status === "pending" ? "bg-orange-500" : "bg-destructive"}`}
                  >
                    Status: {detailsData.status}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-destructive">
                Failed to load details.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservation;
