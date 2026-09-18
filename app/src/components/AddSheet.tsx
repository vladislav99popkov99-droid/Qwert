import { useEffect, useState } from "react";
import { X, CalendarDays, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEntry, EntryType } from "@/types";
import { CATEGORIES } from "@/types";

interface Props {
  calendarId: string;
  open: boolean;
  initialDate: string; // YYYY-MM-DD
  onClose: () => void;
  onSave: (entry: Omit<CalendarEntry, "id" | "createdAt" | "updatedAt">) => void;
}

const QUICK_TITLES: Record<EntryType, string[]> = {
  event: ["Встреча", "Звонок", "День рождения", "Тренировка", "Врач"],
  task: ["Купить", "Оплатить", "Позвонить", "Отправить", "Убраться"],
};

export function AddSheet({ calendarId, open, initialDate, onClose, onSave }: Props) {
  const [type, setType] = useState<EntryType>("event");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("personal");
  const [notes, setNotes] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(0);

  useEffect(() => {
    if (open) {
      setDate(initialDate);
      setType("event");
      setTitle("");
      setTime("");
      setEndTime("");
      setCategory("personal");
      setNotes("");
      setReminderMinutes(0);
    }
  }, [open, initialDate]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const canSave = title.trim().length > 0 && date;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      calendarId,
      type,
      title: title.trim(),
      date,
      time: type === "event" && time ? time : undefined,
      endTime: type === "event" && endTime ? endTime : undefined,
      category,
      notes: notes.trim() || undefined,
      reminderMinutes: type === "event" && reminderMinutes > 0 ? reminderMinutes : undefined,
      done: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[88vh] overflow-y-auto overscroll-contain">
        <div className="sticky top-0 bg-white/95 backdrop-blur pt-3 pb-2 px-5 rounded-t-3xl z-10">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-200 mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Новая запись</h2>
            <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 text-slate-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Тип */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            {(
              [
                { id: "event", label: "Событие", icon: CalendarDays },
                { id: "task", label: "Задача", icon: CheckSquare },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setType(id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all",
                  type === id ? "bg-white shadow text-indigo-600" : "text-slate-500"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Название */}
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "event" ? "Название события" : "Что нужно сделать?"}
              autoFocus
              className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_TITLES[type].map((q) => (
                <button
                  key={q}
                  onClick={() => setTitle(q)}
                  className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium active:bg-indigo-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">Дата</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-base outline-none focus:border-indigo-400"
              />
            </label>
            {type === "event" && (
              <label className="block">
                <span className="text-xs font-medium text-slate-500 mb-1 block">Начало</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-base outline-none focus:border-indigo-400"
                />
              </label>
            )}
          </div>
          {type === "event" && (
            <label className="block -mt-2">
              <span className="text-xs font-medium text-slate-500 mb-1 block">Конец (необязательно)</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-base outline-none focus:border-indigo-400"
              />
            </label>
          )}

          {/* Категория */}
          <div>
            <span className="text-xs font-medium text-slate-500 mb-2 block">Категория</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-full text-sm font-medium transition-all border-2",
                    category === c.id ? "border-current" : "border-transparent"
                  )}
                  style={{
                    background: c.bg,
                    color: c.color,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {type === "event" && time && (
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">Напоминание</span>
              <select value={reminderMinutes} onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-base outline-none focus:border-indigo-400">
                <option value={0}>Без напоминания</option>
                <option value={5}>За 5 минут</option>
                <option value={15}>За 15 минут</option>
                <option value={30}>За 30 минут</option>
                <option value={60}>За 1 час</option>
                <option value={1440}>За 1 день</option>
              </select>
            </label>
          )}

          {/* Заметки */}
          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">Заметки (необязательно)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Детали, ссылка, адрес..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-400 resize-none"
            />
          </label>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              "w-full rounded-2xl py-4 text-base font-semibold text-white transition-all",
              canSave
                ? "bg-indigo-600 shadow-lg shadow-indigo-300 active:scale-[0.98]"
                : "bg-slate-300"
            )}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
