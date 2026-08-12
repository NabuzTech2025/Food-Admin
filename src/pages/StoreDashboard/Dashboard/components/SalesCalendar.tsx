import { useState, useMemo } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useGetAllReports } from "@/hooks/useGetAllReports";
import type { DailyReport } from "@/api/dashboard_report";
import loadingAnim from "@/assets/lottie/loading.json";

export function SalesCalendar({
  onDaySelect,
  selectedDateKey,
}: {
  onDaySelect: (report: DailyReport) => void;
  selectedDateKey?: string;
}) {
  const { data: reports = [], isLoading } = useGetAllReports();

  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const salesMap = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach((r: DailyReport) => {
      const key = r.start_date.slice(0, 10);
      map[key] = (map[key] ?? 0) + r.total_sales;
    });
    return map;
  }, [reports]);

  // dateKey → full DailyReport (used when a day is clicked)
  const reportMap = useMemo(() => {
    const map: Record<string, DailyReport> = {};
    reports.forEach((r: DailyReport) => {
      map[r.start_date.slice(0, 10)] = r;
    });
    return map;
  }, [reports]);

  const monthTotal = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, "0");
    return Object.entries(salesMap)
      .filter(([k]) => k.startsWith(`${y}-${m}`))
      .reduce((sum, [, v]) => sum + v, 0);
  }, [salesMap, viewDate]);

  const prevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; dateKey: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false, dateKey: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, current: true, dateKey });
  }
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay++, current: false, dateKey: "" });
  }

  const monthName = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">{monthName}</p>
          <p className="text-xs text-green-600 font-semibold mt-0.5">
            Total: €{monthTotal.toFixed(2)}
          </p>
        </div>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="bg-gray-900 text-white text-center text-[10px] font-bold py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid — fixed h-96 (6 rows × 64 px) so height never shifts */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96 border-l border-t border-gray-100">
          <Player
            autoplay
            loop
            src={loadingAnim as never}
            style={{ width: 48, height: 48 }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-7 grid-rows-6 h-96 border-l border-t border-gray-100">
          {cells.map((cell, idx) => {
            const sales =
              cell.current && cell.dateKey ? salesMap[cell.dateKey] : undefined;
            const hasData = sales !== undefined && !!reportMap[cell.dateKey];
            const isToday = cell.dateKey === todayKey;
            const isSelected = cell.dateKey === selectedDateKey;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (hasData) onDaySelect(reportMap[cell.dateKey]);
                }}
                className={[
                  "border-r border-b border-gray-100 p-1.5 flex flex-col items-center gap-0.5 overflow-hidden transition-colors",
                  !cell.current ? "bg-gray-50/50" : "",
                  isToday && !isSelected ? "bg-blue-50/60" : "",
                  isSelected
                    ? "bg-green-100 ring-2 ring-inset ring-green-400"
                    : "",
                  hasData
                    ? "cursor-pointer hover:bg-green-50"
                    : "cursor-default",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={`text-xs font-semibold ${
                    !cell.current
                      ? "text-gray-300"
                      : isSelected
                        ? "text-green-700"
                        : isToday
                          ? "text-blue-600"
                          : "text-gray-700"
                  }`}
                >
                  {cell.day}
                </span>
                {sales !== undefined && (
                  <>
                    <TrendingUp
                      className="w-3 h-3 text-green-500"
                      strokeWidth={2}
                    />
                    <span
                      className={`text-[10px] font-bold leading-none ${sales > 0 ? "text-green-600" : "text-gray-400"}`}
                    >
                      {sales > 0
                        ? `€${sales % 1 === 0 ? sales : sales.toFixed(1)}`
                        : "€0"}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Click a day with data to view its report
      </p>
    </div>
  );
}
