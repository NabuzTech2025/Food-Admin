import { useState } from "react";
import { User, CalendarDays, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bookingTypes = ["Premier League", "Champions League", "World Cup"];

function CreateBooking() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "",
    date: "",
    time: "",
  });
  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ponytail: POST to booking API when it exists; navigate back for now
    navigate("../dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5">
      {/* Customer Information */}
      <section className="rounded-xl bg-component-bg border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center">
            <User size={18} />
          </span>
          <h2 className="font-semibold text-foreground">Customer Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder="Enter email address"
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

        <div className="space-y-1.5">
          <Label>Booking / Event</Label>
          <Select value={form.type} onValueChange={set("type")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select booking type" />
            </SelectTrigger>
            <SelectContent>
              {bookingTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <DatePicker value={form.date} onChange={set("date")} placeholder="Select date" />
          </div>
          <div className="space-y-1.5">
            <Label>Time</Label>
            <TimePicker value={form.time} onChange={set("time")} placeholder="Select time" />
          </div>
        </div>
      </section>

      <Button type="submit" className="w-full">
        <Plus className="w-4 h-4" /> Create Booking
      </Button>
    </form>
  );
}

export default CreateBooking;
