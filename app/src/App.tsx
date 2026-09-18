import { useEffect, useMemo, useState } from "react";
import { Plus, Bell, Download, Upload } from "lucide-react";
import { MonthView } from "@/components/MonthView";
import { DayList } from "@/components/DayList";
import { AddSheet } from "@/components/AddSheet";
import { CalendarSwitcher } from "@/components/CalendarSwitcher";
import { useEntries } from "@/hooks/useEntries";
import { toDateKey, type CalendarEntry } from "@/types";


export default function App() {
  const { entries, calendars, ready, addEntry, deleteEntry, toggleDone, addCalendar, restoreBackup } = useEntries();
  const today = toDateKey(new Date());
  const [activeCalendar, setActiveCalendar] = useState("favorite");
  const [selected, setSelected] = useState(today);
  const [monthCursor, setMonthCursor] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => "Notification" in window && Notification.permission === "granted");

  const visibleEntries = useMemo(() => entries.filter(e => e.calendarId === activeCalendar), [entries, activeCalendar]);
  const upcomingCount = useMemo(() => visibleEntries.filter(e => e.date >= today && !e.done).length, [visibleEntries, today]);

  useEffect(() => {
    const saved = localStorage.getItem("active-calendar-v1");
    if (saved && calendars.some(c => c.id === saved)) setActiveCalendar(saved);
  }, [calendars]);
  useEffect(() => { if (calendars.length && !calendars.some(c => c.id === activeCalendar)) setActiveCalendar(calendars[0].id); }, [calendars, activeCalendar]);
  useEffect(() => { localStorage.setItem("active-calendar-v1", activeCalendar); }, [activeCalendar]);

  // Best-effort in-app reminders. True background push is supported by the service worker
  // when a Web Push provider is configured; this timer also works while the app is open.
  useEffect(() => {
    if (!notifications) return;
    const check = () => {
      const now = new Date();
      for (const e of entries) {
        if (!e.time || !e.reminderMinutes || e.done) continue;
        const at = new Date(`${e.date}T${e.time}:00`).getTime() - e.reminderMinutes * 60000;
        if (Math.abs(at - now.getTime()) < 30000) {
          new Notification(e.title, { body: `Событие в ${e.time}`, icon: "./icon-192.svg", tag: e.id });
        }
      }
    };
    check();
    const id = window.setInterval(check, 30000);
    return () => clearInterval(id);
  }, [entries, notifications]);

  const enableNotifications = async () => {
    if (!("Notification" in window)) return alert("Этот браузер не поддерживает уведомления.");
    const permission = await Notification.requestPermission();
    setNotifications(permission === "granted");
  };

  const createCalendar = async () => {
    const name = prompt("Название календаря", "Новый календарь");
    if (!name?.trim()) return;
    const emoji = prompt("Эмодзи", "📅") || "📅";
    const c = await addCalendar(name, emoji);
    setActiveCalendar(c.id);
  };

  const exportBackup = () => {
    const payload = JSON.stringify({ version: 2, exportedAt: Date.now(), calendars, entries }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-calendar-backup.json"; a.click();
    URL.revokeObjectURL(a.href);
  };

  const importBackup = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      try {
        const data = JSON.parse(await file.text()) as { calendars: typeof calendars; entries: CalendarEntry[] };
        await restoreBackup(data);
        alert("Календарь восстановлен из резервной копии.");
      } catch { alert("Не удалось прочитать резервную копию."); }
    };
    input.click();
  };

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-slate-500">Загружаем календарь…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-white">
      <div className="mx-auto max-w-md px-4 pt-1 pb-28">
        <CalendarSwitcher calendars={calendars} activeId={activeCalendar} onChange={setActiveCalendar} onAdd={createCalendar} />
        <header className="mb-5 px-1 pt-2 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-500">
              {calendars.find(c => c.id === activeCalendar)?.emoji} {calendars.find(c => c.id === activeCalendar)?.name}
            </p>
            <h1 className="text-2xl font-bold text-slate-800 mt-0.5">Планы и задачи</h1>
          </div>
          {upcomingCount > 0 && <span className="text-xs text-slate-500 bg-white rounded-full px-3 py-1.5 shadow-sm">впереди: {upcomingCount}</span>}
        </header>

        <MonthView selected={selected} onSelect={setSelected} entries={visibleEntries} monthCursor={monthCursor} onMonthChange={setMonthCursor} />
        <DayList dateKey={selected} entries={visibleEntries} onToggleDone={toggleDone} onDelete={deleteEntry} onAdd={() => setSheetOpen(true)} />

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button onClick={enableNotifications} className="rounded-2xl bg-white p-3 text-xs text-slate-600 shadow-sm flex flex-col items-center gap-1.5">
            <Bell className="h-4 w-4 text-indigo-500" />{notifications ? "Уведомления включены" : "Включить уведомления"}
          </button>
          <button onClick={exportBackup} className="rounded-2xl bg-white p-3 text-xs text-slate-600 shadow-sm flex flex-col items-center gap-1.5">
            <Download className="h-4 w-4 text-indigo-500" />Резервная копия
          </button>
          <button onClick={importBackup} className="rounded-2xl bg-white p-3 text-xs text-slate-600 shadow-sm flex flex-col items-center gap-1.5">
            <Upload className="h-4 w-4 text-indigo-500" />Восстановить
          </button>
        </div>
      </div>

      <button onClick={() => setSheetOpen(true)} aria-label="Добавить" className="fixed bottom-6 h-16 w-16 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-400/50 flex items-center justify-center active:scale-95 transition-transform z-40" style={{ right: "max(1.5rem, calc(50% - 14rem + 1.5rem))" }}>
        <Plus className="h-7 w-7" />
      </button>

      <AddSheet calendarId={activeCalendar} open={sheetOpen} initialDate={selected} onClose={() => setSheetOpen(false)} onSave={addEntry} />
    </div>
  );
}
