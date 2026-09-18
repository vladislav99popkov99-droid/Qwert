import { CheckCircle2, Circle, Clock, Trash2, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEntry } from "@/types";
import { getCategory, fromDateKey } from "@/types";

const DAY_NAMES = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

interface Props {
  dateKey: string;
  entries: CalendarEntry[];
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function DayList({ dateKey, entries, onToggleDone, onDelete, onAdd }: Props) {
  const d = fromDateKey(dateKey);
  const dayEntries = entries
    .filter((e) => e.date === dateKey)
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));

  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-base font-semibold text-slate-800">
          {DAY_NAMES[d.getDay()]}, {d.getDate()} {MONTHS_GEN[d.getMonth()]}
        </h3>
        <span className="text-xs text-slate-400">
          {dayEntries.length > 0 ? `${dayEntries.length} ${plural(dayEntries.length)}` : "свободно"}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {dayEntries.length === 0 && (
          <button
            onClick={onAdd}
            className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-6 flex flex-col items-center gap-2 text-slate-400 active:bg-slate-50"
          >
            <CalendarPlus className="h-6 w-6" />
            <span className="text-sm">Добавить событие или задачу</span>
          </button>
        )}

        {dayEntries.map((e) => {
          const cat = getCategory(e.category);
          const isTask = e.type === "task";
          return (
            <div
              key={e.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl p-3.5 shadow-sm bg-white transition-opacity",
                e.done && "opacity-50"
              )}
              style={{ borderLeft: `4px solid ${cat.color}` }}
            >
              {isTask ? (
                <button onClick={() => onToggleDone(e.id)} className="mt-0.5 shrink-0">
                  {e.done ? (
                    <CheckCircle2 className="h-6 w-6" style={{ color: cat.color }} />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-300" />
                  )}
                </button>
              ) : (
                <span
                  className="mt-0.5 h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-white"
                  style={{ background: cat.color }}
                >
                  <Clock className="h-3.5 w-3.5" />
                </span>
              )}

              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-slate-800 leading-tight", e.done && "line-through")}>
                  {e.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span
                    className="px-1.5 py-0.5 rounded-md font-medium"
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    {cat.label}
                  </span>
                  {e.time && (
                    <span>
                      {e.time}
                      {e.endTime ? ` – ${e.endTime}` : ""}
                    </span>
                  )}
                  {isTask && <span className="text-slate-400">задача</span>}
                </div>
                {e.notes && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{e.notes}</p>}
              </div>

              <button
                onClick={() => onDelete(e.id)}
                className="shrink-0 p-1 text-slate-300 active:text-rose-500"
                aria-label="Удалить"
              >
                <Trash2 className="h-4.5 w-4.5 h-5 w-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "запись";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "записи";
  return "записей";
}
