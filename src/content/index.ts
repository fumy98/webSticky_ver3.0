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
    onCenterClick: () => {
      if (!currentYSaved) return;
      window.scrollTo({ top: getCurrentY(), behavior: "smooth" });
      currentYSaved = false;
    },
    onPetalClick: (scrollY) => {
      if (!currentYSaved) {
        updateCurrentY();
        currentYSaved = true;
      }
      window.scrollTo({ top: scrollY, behavior: "smooth" });
    },
    onPetalDelete: (id) => {
      removeSticky(id);
      refresh();
      showToast("付箋を削除しました");
    },
  });
  refresh();
}

// キーボードショートカット
// document_start で登録するため、ChatGPT等のSPAより先にキャプチャできる
window.addEventListener("keydown", (e) => {
  if (!e.altKey) return;

  // Option+S: 付箋を追加
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

  // Option+D: 全付箋を削除
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

// UIはDOMが必要なためDOMContentLoaded後に初期化
// (document_startで実行されるためDOMがまだ存在しない可能性がある)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    init();
    console.info("[WebSticky] v3.0.0 loaded");
  });
} else {
  init();
  console.info("[WebSticky] v3.0.0 loaded");
}
