import { addSticky, removeSticky, getStickies, updateCurrentY, getCurrentY, isMaxReached } from "./stickyManager";
import { mountSakuraButton, updateSakuraPetals } from "./ui/floatButton";
import { showToast } from "./ui/toast";

function refresh(): void {
  updateSakuraPetals(getStickies());
}

function init(): void {
  mountSakuraButton({
    // 中央（黄色い種）: 保存した現在地へ戻る
    onCenterClick: () => {
      window.scrollTo({ top: getCurrentY(), behavior: "smooth" });
    },
    // 花びら: 対応する付箋位置へジャンプ
    onPetalClick: (scrollY) => {
      updateCurrentY();
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

// Option+S（Mac）/ Alt+S（Win）で付箋を追加
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.code === "KeyS") {
    if (isMaxReached()) {
      showToast("付箋は最大5枚までです");
      return;
    }
    updateCurrentY();
    const added = addSticky();
    if (added) {
      refresh();
      showToast(`📌 付箋を追加しました（${getStickies().length}/5）`);
    }
  }
});

// backgroundからのクリア指示を受信
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CLEAR_STICKIES") {
    sessionStorage.removeItem(`websticky_${location.href}`);
    refresh();
  }
});

init();
console.info("[WebSticky] v3.0.0 loaded");
