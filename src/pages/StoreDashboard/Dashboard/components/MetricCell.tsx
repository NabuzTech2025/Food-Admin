export function MetricCell({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-gray-400" strokeWidth={1.5} />}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
