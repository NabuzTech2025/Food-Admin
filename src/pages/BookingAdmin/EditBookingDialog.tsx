import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
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
import { useUpdateBooking } from "@/hooks/useBookingV2";
import type { BookingV2 } from "@/api/bookingV2";

const statuses: { value: BookingV2["status"]; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "booked", label: "Accepted" },
  { value: "cancelled", label: "Declined" },
];

function EditBookingDialog({
  booking,
  onClose,
}: {
  booking: BookingV2 | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        {booking && <EditForm key={booking.id} booking={booking} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({ booking, onClose }: { booking: BookingV2; onClose: () => void }) {
  const update = useUpdateBooking();
  const start = parseISO(booking.start_at);
  const [form, setForm] = useState({
    customer_name: booking.customer_name ?? "",
    customer_phone: booking.customer_phone ?? "",
    customer_email: booking.customer_email ?? "",
    party_size: String(booking.party_size),
    date: format(start, "yyyy-MM-dd"),
    time: format(start, "HH:mm"),
    status: booking.status,
    note: booking.note ?? "",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        id: booking.id,
        payload: {
          status: form.status,
          start_at: `${form.date}T${form.time}:00`,
          party_size: Number(form.party_size),
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_email: form.customer_email,
          note: form.note,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Booking</DialogTitle>
        <p className="text-xs text-muted-foreground">{booking.reference}</p>
      </DialogHeader>

      <div className="space-y-4 mt-3">
        <div className="space-y-1.5">
          <Label>Customer Name</Label>
          <Input value={form.customer_name} onChange={(e) => set("customer_name")(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.customer_phone} onChange={(e) => set("customer_phone")(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.customer_email} onChange={(e) => set("customer_email")(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <DatePicker value={form.date} onChange={set("date")} />
          </div>
          <div className="space-y-1.5">
            <Label>Time</Label>
            <TimePicker value={form.time} onChange={set("time")} />
          </div>
          <div className="space-y-1.5">
            <Label>Guests</Label>
            <Input type="number" min={1} value={form.party_size} onChange={(e) => set("party_size")(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status")(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Note</Label>
          <Textarea value={form.note} onChange={(e) => set("note")(e.target.value)} rows={3} />
        </div>
      </div>

      <DialogFooter className="mt-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={update.isPending}>
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export default EditBookingDialog;
