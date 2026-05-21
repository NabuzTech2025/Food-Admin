import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
      <div
        className={`w-12 h-12 ${iconBg} ${iconColor} rounded-full flex items-center justify-center`}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <h3 className="text-2xl font-bold text-neutral-800">{value}</h3>
      </div>
    </div>
  );
}

export default StatCard;
