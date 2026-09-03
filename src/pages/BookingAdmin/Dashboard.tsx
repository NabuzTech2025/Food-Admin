import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  PoundSterling,
  Users,
  Plus,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ponytail: static demo data; wire to booking API when the endpoint exists
const stats = [
  { label: "Total Bookings", value: "24", icon: CalendarDays },
  { label: "Pending", value: "6", icon: Clock },
  { label: "Accepted", value: "15", icon: CheckCircle2 },
  { label: "Declined", value: "3", icon: XCircle },
  { label: "Revenue (Accepted)", value: "£1,250.00", icon: PoundSterling },
  { label: "Total Guests", value: "48", icon: Users },
];

const chartData = [
  { day: "Mon", value: 8 },
  { day: "Tue", value: 6 },
  { day: "Wed", value: 14 },
  { day: "Thu", value: 24 },
  { day: "Fri", value: 9 },
  { day: "Sat", value: 18 },
  { day: "Sun", value: 15 },
];

const schedule = [
  { time: "10:00 AM", title: "Premier League", sub: "Sarah Ahmed · 8 Guests", status: "Accepted" },
  { time: "12:30 PM", title: "Champions League", sub: "John Smith · 6 Guests", status: "Pending" },
  { time: "03:00 PM", title: "World Cup", sub: "Michael Brown · 10 Guests", status: "Accepted" },
  { time: "05:00 PM", title: "Available Slot", sub: "05:00 PM - 06:00 PM", status: null },
];

const ranges = ["Daily", "Weekly", "Monthly"] as const;

const statusBadge = (status: string) =>
  status === "Accepted" ? (
    <Badge className="bg-green-600 text-white">Accepted</Badge>
  ) : (
    <Badge className="bg-amber-500 text-white">Pending</Badge>
  );

function StatCard({ label, value, icon: Icon }: (typeof stats)[number]) {
  return (
    <div className="rounded-xl bg-component-bg border border-border p-5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
      <span className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
        <Icon size={18} />
      </span>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState<(typeof ranges)[number]>("Daily");

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 flex-wrap rounded-xl bg-component-bg border border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bookings Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEE, d MMMM yyyy")}
          </p>
        </div>
        <Button onClick={() => navigate("../create")}>
          <Plus className="w-4 h-4" /> Create Booking
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Booking overview chart */}
        <section className="lg:col-span-2 rounded-xl bg-component-bg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Booking Overview</h2>
            <div className="flex gap-1 text-xs">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-medium transition-colors",
                    range === r
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barCategoryGap="35%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} domain={[0, 30]} ticks={[0, 10, 20, 30]} width={24} />
              <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 8, 8]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Today's schedule */}
        <section className="rounded-xl bg-component-bg border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-foreground">Today's Schedule</h2>
            <button
              onClick={() => navigate("../bookings")}
              className="text-primary font-medium text-sm hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-border">
            {schedule.map((item) => (
              <div key={item.time} className="flex items-center gap-3 py-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{item.time}</span>
                <span className="w-px self-stretch bg-border" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                </div>
                {item.status && statusBadge(item.status)}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
