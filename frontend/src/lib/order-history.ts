const KEY = "wallistan_orders_v1";

export type SavedOrder = {
  id: number;
  number: string;
  email: string;
};

export function listSavedOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: SavedOrder) {
  if (typeof window === "undefined") return;
  const existing = listSavedOrders().filter((o) => o.id !== order.id);
  window.localStorage.setItem(KEY, JSON.stringify([order, ...existing]));
}

export function removeSavedOrder(id: number) {
  if (typeof window === "undefined") return;
  const next = listSavedOrders().filter((o) => o.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
