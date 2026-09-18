export type EntryType = "event" | "task";

export interface CalendarEntry {
  id: string;
  calendarId: string;
  type: EntryType;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  category: string;
  notes?: string;
  done?: boolean;
  reminderMinutes?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Calendar {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
}

export const DEFAULT_CALENDARS: Calendar[] = [
  { id: "favorite", name: "Любимый", emoji: "❤️", color: "#ec4899", createdAt: Date.now() },
  { id: "family", name: "Семья", emoji: "👨‍👩‍👧", color: "#f59e0b", createdAt: Date.now() },
  { id: "work", name: "Работа", emoji: "💼", color: "#0ea5e9", createdAt: Date.now() },
  { id: "friends", name: "Друзья", emoji: "👥", color: "#8b5cf6", createdAt: Date.now() },
];

export interface Category {
  id: string;
  label: string;
  color: string;
  bg: string;
}

export const CATEGORIES: Category[] = [
  { id: "personal", label: "Личное", color: "#6366f1", bg: "#eef2ff" },
  { id: "work", label: "Работа", color: "#0ea5e9", bg: "#f0f9ff" },
  { id: "health", label: "Здоровье", color: "#10b981", bg: "#ecfdf5" },
  { id: "family", label: "Семья", color: "#f59e0b", bg: "#fffbeb" },
  { id: "finance", label: "Финансы", color: "#ef4444", bg: "#fef2f2" },
  { id: "other", label: "Другое", color: "#8b5cf6", bg: "#f5f3ff" },
];

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
export function toDateKey(d: Date): string {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
