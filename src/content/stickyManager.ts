import type { Sticky } from "../types";
import { getStore, saveStore, clearStore } from "./storage";

const MAX_STICKIES = 5;

function currentUrl(): string {
  return location.href;
}

// 現在のスクロール位置に付箋を追加（5枚上限チェック）
export function addSticky(): boolean {
  const store = getStore(currentUrl());
  if (store.stickies.length >= MAX_STICKIES) return false;

  const sticky: Sticky = {
    id: crypto.randomUUID(),
    scrollY: window.scrollY,
    createdAt: Date.now(),
  };
  store.stickies.push(sticky);
  saveStore(store);
  return true;
}

// 指定IDの付箋を削除
export function removeSticky(id: string): void {
  const store = getStore(currentUrl());
  store.stickies = store.stickies.filter((s) => s.id !== id);
  saveStore(store);
}

// 付箋一覧を取得
export function getStickies(): Sticky[] {
  return getStore(currentUrl()).stickies;
}

// 現在地を更新
export function updateCurrentY(): void {
  const store = getStore(currentUrl());
  store.currentY = window.scrollY;
  saveStore(store);
}

// 現在地を取得
export function getCurrentY(): number {
  return getStore(currentUrl()).currentY;
}

// 上限チェック
export function isMaxReached(): boolean {
  return getStore(currentUrl()).stickies.length >= MAX_STICKIES;
}

// 全付箋を削除
export function clearAllStickies(): void {
  clearStore(currentUrl());
}
