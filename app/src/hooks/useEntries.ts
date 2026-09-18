import { useCallback, useEffect, useState } from "react";
import type { Calendar, CalendarEntry } from "@/types";
import { DEFAULT_CALENDARS } from "@/types";

const DB_NAME = "my-calendar-db";
const DB_VERSION = 1;
const ENTRIES = "entries";
const CALENDARS = "calendars";
const LEGACY_KEY = "my-calendar-entries-v1";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ENTRIES)) db.createObjectStore(ENTRIES, { keyPath: "id" });
      if (!db.objectStoreNames.contains(CALENDARS)) db.createObjectStore(CALENDARS, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAll<T>(store: string): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readonly").objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function put<T>(store: string, value: T) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const req = db.transaction(store, "readwrite").objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
async function remove(store: string, id: string) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const req = db.transaction(store, "readwrite").objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function migrateLegacy() {
  const calendars = await getAll<Calendar>(CALENDARS);
  if (!calendars.length) for (const c of DEFAULT_CALENDARS) await put(CALENDARS, c);
  const entries = await getAll<CalendarEntry>(ENTRIES);
  if (entries.length) return;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    const old = raw ? JSON.parse(raw) : [];
    if (Array.isArray(old)) {
      for (const e of old) await put(ENTRIES, {
        ...e,
        calendarId: "favorite",
        updatedAt: e.updatedAt ?? e.createdAt ?? Date.now(),
      });
    }
  } catch { /* ignore malformed legacy data */ }
}

export function useEntries() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await migrateLegacy();
        setEntries(await getAll<CalendarEntry>(ENTRIES));
        setCalendars((await getAll<Calendar>(CALENDARS)).sort((a,b) => a.createdAt-b.createdAt));
      } finally { setReady(true); }
    })();
  }, []);

  const addEntry = useCallback(async (entry: Omit<CalendarEntry, "id" | "createdAt" | "updatedAt">) => {
    const now = Date.now();
    const next = { ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    await put(ENTRIES, next);
    setEntries(p => [...p, next]);
  }, []);

  const updateEntry = useCallback(async (id: string, patch: Partial<CalendarEntry>) => {
    const current = entries.find(e => e.id === id);
    if (!current) return;
    const next = { ...current, ...patch, updatedAt: Date.now() };
    await put(ENTRIES, next);
    setEntries(p => p.map(e => e.id === id ? next : e));
  }, [entries]);

  const deleteEntry = useCallback(async (id: string) => {
    await remove(ENTRIES, id);
    setEntries(p => p.filter(e => e.id !== id));
  }, []);

  const toggleDone = useCallback(async (id: string) => {
    const current = entries.find(e => e.id === id);
    if (current) await updateEntry(id, { done: !current.done });
  }, [entries, updateEntry]);

  const addCalendar = useCallback(async (name: string, emoji: string) => {
    const c: Calendar = { id: crypto.randomUUID(), name: name.trim(), emoji, color: "#6366f1", createdAt: Date.now() };
    await put(CALENDARS, c);
    setCalendars(p => [...p, c]);
    return c;
  }, []);

  const restoreBackup = useCallback(async (data: { calendars: Calendar[]; entries: CalendarEntry[] }) => {
    for (const c of data.calendars ?? []) await put(CALENDARS, c);
    for (const e of data.entries ?? []) await put(ENTRIES, e);
    setCalendars((await getAll<Calendar>(CALENDARS)).sort((a,b) => a.createdAt-b.createdAt));
    setEntries(await getAll<CalendarEntry>(ENTRIES));
  }, []);

  const deleteCalendar = useCallback(async (id: string) => {
    if (calendars.length <= 1) return;
    const related = entries.filter(e => e.calendarId === id);
    for (const e of related) await remove(ENTRIES, e.id);
    await remove(CALENDARS, id);
    setEntries(p => p.filter(e => e.calendarId !== id));
    setCalendars(p => p.filter(c => c.id !== id));
  }, [calendars.length, entries]);

  return { entries, calendars, ready, addEntry, updateEntry, deleteEntry, toggleDone, addCalendar, deleteCalendar, restoreBackup };
}
