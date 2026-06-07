import { addSticky, removeSticky, clearAllStickies, getStickies, updateCurrentY, getCurrentY, isMaxReached } from "./stickyManager";
import { mountSakuraButton, updateSakuraPetals } from "./ui/floatButton";
import { showToast } from "./ui/toast";

// 花びらをクリックして現在地が保存されたかどうか
let currentYSaved = false;

function refresh(): void {
  updateSakuraPetals(getStickies());
}

function init(): void {
  mountSakuraButton({
    // 中央（黄色い種）: 花びらをクリックした直前の位置へ戻る
    // 花びらを一度もクリックしていない場合は何もしない
    onCenterClick: () => {
      if (!currentYSaved) return;
      window.scrollTo({ top: getCurrentY(), behavior: "smooth" });
    },
    // 花びら: クリック直前の位置を現在地として保存してからジャンプ
    onPetalClick: (scrollY) => {
      updateCurrentY();
      currentYSaved = true;
      window.scrollTo({ top: scrollY, behavior: "smooth" });
    },
    // 花びら右クリック: 付箋を削除
    onPetalDelete: (id) => {
      removeSticky(id);
      refresh();
      showToast("付箋を削除しました");
    },
  });
  refresh();
}

// キーボードショートカット（capture: true でページの横取りより優先）
window.addEventListener("keydown", (e) => {
  if (!e.altKey) return;

  // Option+S（Mac）/ Alt+S（Win）: 付箋を追加
  if (e.code === "KeyS") {
    e.preventDefault();
    if (isMaxReached()) {
      showToast("付箋は最大5枚までです");
      return;
    }
    const added = addSticky();
    if (added) {
      refresh();
      showToast(`📌 付箋を追加しました（${getStickies().length}/5）`);
    }
  }

  // Option+D（Mac）/ Alt+D（Win）: 全付箋を削除
  if (e.code === "KeyD") {
    e.preventDefault();
    if (getStickies().length === 0) return;
    clearAllStickies();
    currentYSaved = false;
    refresh();
    showToast("🗑 付箋を全て削除しました");
  }
}, { capture: true });

// backgroundからのメッセージを受信
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CLEAR_STICKIES") {
    // 遷移元ページ含む全付箋データをクリア
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith("websticky_"))
      .forEach((key) => sessionStorage.removeItem(key));
    refresh();
  }
  if (message.type === "TOGGLE_VISIBILITY") {
    const container = document.getElementById("websticky-sakura");
    if (container) {
      container.style.display = container.style.display === "none" ? "" : "none";
    }
  }
});

// ナビゲーション種別に応じて付箋クリア
// - リロード → 維持
// - 遷移・戻る/進む・bfcacheからの復元 → クリア
window.addEventListener("pageshow", (e) => {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const isReload = !e.persisted && nav?.type === "reload";
  if (!isReload) {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith("websticky_"))
      .forEach((key) => sessionStorage.removeItem(key));
    refresh();
  }
});

init();
console.info("[WebSticky] v3.0.0 loaded");
