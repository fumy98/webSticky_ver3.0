import type { StickyStore } from "../types";

const KEY_PREFIX = "websticky_";

// 付箋データの取得
export function getStore(url: string): StickyStore {
  const raw = sessionStorage.getItem(KEY_PREFIX + url);
  if (!raw) {
    return { url, stickies: [], currentY: 0 };
  }
  return JSON.parse(raw) as StickyStore;
}

// 付箋データの保存
export function saveStore(store: StickyStore): void {
  sessionStorage.setItem(KEY_PREFIX + store.url, JSON.stringify(store));
}

// 付箋データの削除
export function clearStore(url: string): void {
  sessionStorage.removeItem(KEY_PREFIX + url);
}
