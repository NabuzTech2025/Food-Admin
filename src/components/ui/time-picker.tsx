import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Analog clock-face time picker in a popover. Value is 24h "HH:mm"; the UI
// works in 12h + AM/PM. Pick the hour, then the minute (5-min marks).
const SIZE = 240;
const R = 92;
const C = SIZE / 2;

// Point on the clock for an angle measured in degrees clockwise from 12 o'clock.
const pointAt = (deg: number) => ({
  x: C + R * Math.sin((deg * Math.PI) / 180),
  y: C - R * Math.cos((deg * Math.PI) / 180),
});

export function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"hours" | "minutes">("hours");

  const h24 = value ? Number(value.slice(0, 2)) : 9;
  const min = value ? Number(value.slice(3, 5)) : 0;
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;

  const emit = (nextH24: number, nextMin: number) =>
    onChange(
      `${String(nextH24).padStart(2, "0")}:${String(nextMin).padStart(2, "0")}`,
    );

  const pickHour = (hh12: number) => {
    emit(period === "PM" ? (hh12 % 12) + 12 : hh12 % 12, min);
    setMode("minutes");
  };
  const pickMinute = (mm: number) => emit(h24, mm);
  const setPeriod = (p: "AM" | "PM") =>
    emit(p === "PM" ? (h24 % 12) + 12 : h24 % 12, min);

  const numbers =
    mode === "hours"
      ? Array.from({ length: 12 }, (_, i) => i + 1) // 1..12
      : Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,…55
  const angleFor = (n: number) => (mode === "hours" ? n * 30 : n * 6);
  const activeValue = mode === "hours" ? h12 : Math.round(min / 5) * 5 % 60;
  const hand = pointAt(angleFor(mode === "hours" ? h12 : min));

  const display = value
    ? `${h12}:${String(min).padStart(2, "0")} ${period}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
        >
          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className={value ? "" : "text-muted-foreground"}>
            {display}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        {/* Header: hh : mm and AM/PM, each toggles what the face edits */}
        <div className="flex items-center justify-center gap-2 mb-3 text-3xl font-semibold tabular-nums">
          <button
            type="button"
            onClick={() => setMode("hours")}
            className={cn(
              "px-1 rounded",
              mode === "hours" ? "text-primary" : "text-muted-foreground",
            )}
          >
            {String(h12).padStart(2, "0")}
          </button>
          <span className="text-muted-foreground">:</span>
          <button
            type="button"
            onClick={() => setMode("minutes")}
            className={cn(
              "px-1 rounded",
              mode === "minutes" ? "text-primary" : "text-muted-foreground",
            )}
          >
            {String(min).padStart(2, "0")}
          </button>
          <div className="flex flex-col ml-2 text-sm gap-1">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-2 py-0.5 rounded border border-border",
                  period === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Clock face */}
        <div
          className="relative rounded-full bg-muted"
          style={{ width: SIZE, height: SIZE }}
        >
          <svg width={SIZE} height={SIZE} className="absolute inset-0">
            <line
              x1={C}
              y1={C}
              x2={hand.x}
              y2={hand.y}
              className="stroke-primary"
              strokeWidth={2}
            />
            <circle cx={C} cy={C} r={3} className="fill-primary" />
            <circle cx={hand.x} cy={hand.y} r={16} className="fill-primary" />
          </svg>
          {numbers.map((n) => {
            const p = pointAt(angleFor(n));
            const selected = n === activeValue;
            return (
              <button
                key={n}
                type="button"
                onClick={() =>
                  mode === "hours" ? pickHour(n) : pickMinute(n)
                }
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-sm flex items-center justify-center tabular-nums z-10",
                  selected
                    ? "text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-background/60",
                )}
                style={{ left: p.x, top: p.y }}
              >
                {mode === "minutes" ? String(n).padStart(2, "0") : n}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
