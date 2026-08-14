import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

import type { ReservationV2 } from "@/api/reservationV2";

interface ReservationTooltipProps {
  x: number;
  y: number;
  reservation: ReservationV2;
  color: string;
}

const fmtTime = (iso: string) => {
  const date = new Date(iso);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export function getContrastText(bgColor: string): "#000000" | "#ffffff" {
  const hex = bgColor.replace("#", "");
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // WCAG relative luminance
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;

  return luminance > 0.5 ? "#000000" : "#ffffff";
}

interface TooltipRowProps {
  color: string;
  textColor: string;
  icon: ReactNode;
  children: ReactNode;
  withDivider?: boolean;
}

function TooltipRow({
  color,
  textColor,
  icon,
  children,
  withDivider,
}: TooltipRowProps) {
  return (
    <>
      <div
        style={{ backgroundColor: color }}
        className="flex min-h-[52px] items-center gap-3 rounded-xl px-4 py-2"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>

        <span
          className="text-[17px] font-semibold capitalize"
          style={{ color: textColor }}
        >
          {children}
        </span>
      </div>

      {withDivider && (
        <div className="ml-12 border-t" style={{ borderColor: `${color}25` }} />
      )}
    </>
  );
}

export default function ReservationTooltip({
  x,
  y,
  reservation,
  color,
}: ReservationTooltipProps) {
  const textColor = getContrastText(color);

  const StatusIcon =
    reservation.status === "cancelled"
      ? XCircle
      : reservation.status === "pending"
        ? Clock
        : CheckCircle2;

  const iconProps = {
    className: "h-[18px] w-[18px]",
    style: { color: textColor },
  };

  return (
    <div
      className="fixed z-[9999] w-[340px] rounded-2xl border p-5 shadow-xl pointer-events-none"
      style={{
        left: x,
        top: y,
        backgroundColor: `${color}10`,
        borderColor: color,
      }}
    >
      {/* Header */}
      <div
        style={{ backgroundColor: color }}
        className="relative mb-4 flex items-center justify-between rounded-xl px-4 py-2"
      >
        <p
          className="truncate text-xl font-semibold pl-2"
          style={{ color: textColor }}
        >
          {reservation.customer_name || "Guest"}
        </p>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <CalendarDays className="h-5 w-5" style={{ color: textColor }} />
        </div>
      </div>

      <TooltipRow
        color={color}
        textColor={textColor}
        icon={<Clock {...iconProps} />}
        withDivider
      >
        {fmtTime(reservation.reserved_for)} –{" "}
        {fmtTime(reservation.reserved_until)}
        <span className="normal-case opacity-80">
          {" "}
          • {reservation.duration_minutes} min
        </span>
      </TooltipRow>

      <TooltipRow
        color={color}
        textColor={textColor}
        icon={<Users {...iconProps} />}
        withDivider
      >
        {reservation.party_size} guests
      </TooltipRow>

      <TooltipRow
        color={color}
        textColor={textColor}
        icon={<StatusIcon {...iconProps} />}
      >
        {reservation.status}
      </TooltipRow>
    </div>
  );
}
