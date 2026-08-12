import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { ArrowLeft, Utensils } from "lucide-react";
import {
  getReservationDetails,
  type ReservationDetail,
} from "../../api/reservation";
import { Button } from "../../components/ui/button";

interface ReservationDetailModalProps {
  reservationId: number | null;
  onClose: () => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservationId,
  onClose,
}) => {
  const [data, setData] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reservationId) {
      setLoading(true);
      setError(null);
      getReservationDetails(reservationId)
        .then((res) => setData(res))
        .catch((err) => setError(err.message || "Failed to fetch details"))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [reservationId]);

  return (
    <Dialog open={!!reservationId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-2xl rounded-xl">
        <DialogDescription className="sr-only">
          Reservation Details
        </DialogDescription>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-destructive">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-background">
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  Reservation Details
                </h2>
              </div>
            </div>

            <hr className="border-border" />

            <div className="p-5 flex-1 space-y-5 bg-background">
              {/* Order Info */}
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <h3 className="text-lg font-medium text-foreground">
                  Order ID: {data.id}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Date: {format(new Date(data.created_at), "dd-MM-yyyy HH:mm")}
                </p>
              </div>

              <hr className="border-border" />

              {/* Customer Info */}
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <span className="text-foreground font-medium w-24">
                    Customer
                  </span>
                  <span className="text-foreground">
                    : {data.customer_name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground font-medium w-24">
                    Phone
                  </span>
                  <span className="text-foreground">
                    : {data.customer_phone || "-"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground font-medium w-24">
                    Guest
                  </span>
                  <span className="text-foreground">: {data.guest_count}</span>
                </div>
              </div>

              <hr className="border-border" />

              {/* Reservation Date */}
              <div className="flex gap-2">
                <span className="text-foreground font-medium">
                  Reservation Date:
                </span>
                <span className="text-foreground">
                  {format(new Date(data.reserved_for), "dd-MM-yyyy HH:mm")}
                </span>
              </div>

              <hr className="border-border" />

              {/* Note */}
              <div className="flex gap-2">
                <span className="text-foreground font-medium">Note:</span>
                <span className="text-foreground">{data.note || "-"}</span>
              </div>
            </div>

            {/* Status Button at bottom */}
            <div className="p-6 bg-background flex justify-center pb-8 pt-10">
              <div
                className={`px-8 py-3 rounded-full font-medium shadow-sm ${
                  data.status.toLowerCase() === "booked"
                    ? "bg-primary text-primary-foreground"
                    : data.status.toLowerCase() === "cancelled"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-secondary-foreground"
                }`}
              >
                Status: {data.status.toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
