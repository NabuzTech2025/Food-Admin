import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// 24-hour (military time) picker in a popover. Value is "HH:mm" (no AM/PM).
// Two scrollable columns: hour 00–23, minute 00–59.
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  error = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [h, m] = value ? value.split(":") : ["", ""];
  const pick = (hh: string, mm: string) => onChange(`${hh}:${mm}`);

  const cell = (selected: boolean) =>
    cn(
      "px-3 py-1.5 text-sm text-center cursor-pointer rounded transition-colors tabular-nums",
      selected
        ? "bg-primary text-primary-foreground font-medium"
        : "hover:bg-muted text-foreground",
    );
  const colHeader =
    "sticky top-0 bg-popover text-xs font-semibold text-muted-foreground text-center pb-1";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal h-10",
            error && "border-destructive",
            className,
          )}
        >
          <Clock className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
          <span className={value ? "" : "text-muted-foreground"}>
            {value ? `${h}:${m}` : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          <div className="max-h-56 overflow-y-auto pr-1">
            <div className={colHeader}>Hour</div>
            {HOURS.map((hh) => (
              <div
                key={hh}
                onClick={() => pick(hh, m || "00")}
                className={cell(hh === h)}
              >
                {hh}
              </div>
            ))}
          </div>
          <div className="max-h-56 overflow-y-auto pl-1 border-l">
            <div className={colHeader}>Min</div>
            {MINUTES.map((mm) => (
              <div
                key={mm}
                onClick={() => pick(h || "00", mm)}
                className={cell(mm === m)}
              >
                {mm}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
