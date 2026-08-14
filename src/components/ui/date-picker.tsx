import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Calendar-in-a-popover date picker. Value is an ISO date string (yyyy-MM-dd).
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
        >
          <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
          {selected ? (
            format(selected, "PP")
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
