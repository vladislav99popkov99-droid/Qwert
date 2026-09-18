import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEntry } from "@/types";
import { getCategory, toDateKey } from "@/types";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

interface Props {
  selected: string; // date key
  onSelect: (key: string) => void;
  entries: CalendarEntry[];
  monthCursor: Date;
  onMonthChange: (d: Date) => void;
}

export function MonthView({ selected, onSelect, entries, monthCursor, onMonthChange }: Props) {
  const todayKey = toDateKey(new Date());

  const days = useMemo(() => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    const first = new Date(y, m, 1);
    // Monday-first offset
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(y, m + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= count; d++) cells.push(new Date(y, m, d));
    return cells;
  }, [monthCursor]);

  const dotsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const e of entries) {
      const list = map.get(e.date) ?? [];
      const color = getCategory(e.category).color;
      if (!list.includes(color)) list.push(color);
      map.set(e.date, list);
    }
    return map;
  }, [entries]);

  const shiftMonth = (delta: number) => {
    onMonthChange(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + delta, 1));
  };

  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-semibold text-slate-800">
          {MONTHS[monthCursor.getMonth()]}{" "}
          <span className="text-slate-400 font-normal">{monthCursor.getFullYear()}</span>
        </h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => shiftMonth(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "text-center text-[11px] font-medium py-1",
              i >= 5 ? "text-rose-400" : "text-slate-400"
            )}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const key = toDateKey(d);
          const isSelected = key === selected;
          const isToday = key === todayKey;
          const dots = dotsByDate.get(key) ?? [];
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="flex flex-col items-center py-0.5 focus:outline-none"
            >
              <span
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-full text-sm transition-all",
                  isSelected
                    ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-300"
                    : isToday
                      ? "ring-2 ring-indigo-300 text-indigo-700 font-semibold"
                      : "text-slate-700 active:bg-slate-100"
                )}
              >
                {d.getDate()}
              </span>
              <span className="flex gap-0.5 h-1.5 mt-0.5">
                {dots.slice(0, 3).map((c) => (
                  <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
