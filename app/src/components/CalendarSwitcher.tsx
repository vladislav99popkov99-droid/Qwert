import { Plus, Settings2 } from "lucide-react";
import type { Calendar } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  calendars: Calendar[];
  activeId: string;
  onChange: (id: string) => void;
  onAdd: () => void;
}

export function CalendarSwitcher({ calendars, activeId, onChange, onAdd }: Props) {
  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 pt-3 pb-2 bg-gradient-to-b from-indigo-50 via-indigo-50/95 to-transparent">
      <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x touch-pan-x pb-1">
        {calendars.map(c => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={cn(
              "shrink-0 snap-start rounded-full px-3.5 py-2 text-sm font-medium transition-all border",
              activeId === c.id ? "bg-white shadow-md border-white text-slate-800" : "bg-white/60 border-white/70 text-slate-500"
            )}
          >
            <span className="mr-1.5">{c.emoji}</span>{c.name}
          </button>
        ))}
        <button onClick={onAdd} aria-label="Создать календарь" className="shrink-0 rounded-full h-9 w-9 bg-white/80 border border-white flex items-center justify-center text-indigo-600 shadow-sm">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function CalendarSettingsHint() {
  return <Settings2 className="h-4 w-4 text-slate-400" />;
}
