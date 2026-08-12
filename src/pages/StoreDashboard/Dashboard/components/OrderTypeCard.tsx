export function OrderTypeCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  const active = value > 0;
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border transition-all ${
        active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"
      }`}
    >
      <div className={`p-2 rounded-lg ${active ? "bg-green-100" : "bg-gray-100"}`}>
        <Icon
          className={`w-5 h-5 ${active ? "text-green-600" : "text-gray-400"}`}
          strokeWidth={1.5}
        />
      </div>
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-2xl font-bold ${active ? "text-green-600" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}
