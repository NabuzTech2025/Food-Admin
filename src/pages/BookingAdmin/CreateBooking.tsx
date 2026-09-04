import { useForm, Controller } from "react-hook-form";
import { User, CalendarDays, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useServices,
  useBookingStoreId,
  useServiceAvailability,
  useCreateGuestBooking,
} from "@/hooks/useBookingV2";

type FormValues = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_id: string;
  date: string;
  party_size: string;
  start_at: string; // chosen slot datetime
  note: string;
};

function CreateBooking() {
  const navigate = useNavigate();
  const storeId = useBookingStoreId();
  const { data: services = [] } = useServices(storeId, false);
  const createBooking = useCreateGuestBooking();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      service_id: "",
      date: "",
      party_size: "",
      start_at: "",
      note: "",
    },
  });

  const serviceId = watch("service_id");
  const date = watch("date");
  const partySize = Number(watch("party_size"));
  const startAt = watch("start_at");

  const { data: availability, isFetching: loadingSlots } =
    useServiceAvailability(
      serviceId ? Number(serviceId) : null,
      date,
      partySize,
    );

  const onSubmit = (v: FormValues) => {
    if (!storeId) return;
    createBooking.mutate(
      {
        store_id: storeId,
        service_id: Number(v.service_id),
        start_at: v.start_at,
        party_size: Number(v.party_size),
        customer_name: v.customer_name,
        customer_phone: v.customer_phone || undefined,
        customer_email: v.customer_email || undefined,
        note: v.note || undefined,
        option_ids: [],
        form_data: {},
      },
      { onSuccess: () => navigate("../bookings") },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto space-y-5"
    >
      {/* Customer Information */}
      <section className="rounded-xl bg-component-bg border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center">
            <User size={18} />
          </span>
          <h2 className="font-semibold text-foreground">
            Customer Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input
              id="customer_name"
              placeholder="Enter customer name"
              {...register("customer_name", {
                required: "Customer name is required",
              })}
            />
            {errors.customer_name && (
              <p className="text-sm text-destructive">
                {errors.customer_name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer_phone">Phone Number</Label>
            <Input
              id="customer_phone"
              type="tel"
              placeholder="Enter phone number"
              {...register("customer_phone")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer_email">Email Address</Label>
            <Input
              id="customer_email"
              type="email"
              placeholder="Enter email address"
              {...register("customer_email")}
            />
          </div>
        </div>
      </section>

      {/* Booking Information */}
      <section className="rounded-xl bg-component-bg border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center">
            <CalendarDays size={18} />
          </span>
          <h2 className="font-semibold text-foreground">Booking Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Booking / Event</Label>
            <Controller
              control={control}
              name="service_id"
              rules={{ required: "Select a service" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("start_at", ""); // reset slot when service changes
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select booking type" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.service_id && (
              <p className="text-sm text-destructive">
                {errors.service_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Controller
              control={control}
              name="date"
              rules={{ required: "Select a date" }}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue("start_at", "");
                  }}
                  placeholder="Select date"
                />
              )}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="party_size">Guest Number</Label>
            <Input
              id="party_size"
              type="number"
              min={1}
              placeholder="Number of guests"
              {...register("party_size", {
                required: "Guest number is required",
                min: { value: 1, message: "At least 1 guest" },
                onChange: () => setValue("start_at", ""),
              })}
            />
            {errors.party_size && (
              <p className="text-sm text-destructive">
                {errors.party_size.message}
              </p>
            )}
          </div>
        </div>

        {/* Availability slots */}
        {serviceId && date && partySize > 0 && (
          <div className="space-y-2">
            <Label>Available Times</Label>
            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">Loading slots…</p>
            ) : !availability?.enabled ? (
              <p className="text-sm text-muted-foreground">
                {availability?.reason || "No availability for this selection."}
              </p>
            ) : availability.slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No slots for this date.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {availability.slots.map((slot) => (
                  <button
                    key={slot.datetime}
                    type="button"
                    disabled={!slot.bookable}
                    onClick={() =>
                      setValue("start_at", slot.datetime, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "px-2 py-1.5 rounded-lg border transition-colors flex flex-col items-center leading-tight cursor-pointer",
                      startAt === slot.datetime
                        ? "bg-primary text-primary-foreground border-primary"
                        : slot.bookable
                          ? "bg-component-bg text-foreground border-border hover:border-primary"
                          : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50",
                    )}
                  >
                    <span className="text-sm font-medium">{slot.time}</span>
                    <span
                      className={cn(
                        "text-[11px]",
                        startAt === slot.datetime
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {slot.available}/{slot.total} left
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            rows={2}
            placeholder="Any special requests…"
            {...register("note")}
          />
        </div>
      </section>

      <Button
        type="submit"
        className="w-full"
        disabled={createBooking.isPending || !startAt}
      >
        <Plus className="w-4 h-4" /> Create Booking
      </Button>
    </form>
  );
}

export default CreateBooking;
