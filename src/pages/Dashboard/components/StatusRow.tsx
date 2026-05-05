import { Clock, CheckCircle2, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    badge: "bg-amber-100 text-amber-700",
  },
  accepted: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-100",
    badge: "bg-green-100 text-green-700",
  },
  declined: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-50",
    border: "border-red-100",
    badge: "bg-red-100 text-red-700",
  },
};

export function StatusRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "pending" | "accepted" | "declined";
}) {
  const cfg = STATUS_CONFIG[variant];
  const Icon = cfg.icon;
  return (
    <div
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} strokeWidth={1.5} />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
        {value}
      </span>
    </div>
  );
}
