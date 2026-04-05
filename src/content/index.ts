import { addSticky, removeSticky, getStickies, updateCurrentY, getCurrentY, isMaxReached } from "./stickyManager";
import { mountFloatButton, updateFloatButtonState } from "./ui/floatButton";
import { mountListPanel, renderPanel, togglePanel, hidePanel } from "./ui/listPanel";
import { showToast } from "./ui/toast";

// UIを初期化
function init(): void {
  mountFloatButton(() => {
    updateCurrentY();
    renderPanel(getStickies(), getCurrentY());
    togglePanel();
  });

  mountListPanel({
    onJump: (scrollY) => {
      window.scrollTo({ top: scrollY, behavior: "smooth" });
    },
    onDelete: (id) => {
      removeSticky(id);
      renderPanel(getStickies(), getCurrentY());
      updateFloatButtonState(getStickies().length);
    },
    onCurrentJump: (scrollY) => {
      window.scrollTo({ top: scrollY, behavior: "smooth" });
    },
  });

  updateFloatButtonState(getStickies().length);
}

// Option+S（Mac）/ Alt+S（Win）で付箋を追加
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.code === "KeyS") {
    if (isMaxReached()) {
      showToast("付箋は最大5枚までです");
      return;
    }
    const added = addSticky();
    if (added) {
      const count = getStickies().length;
      updateFloatButtonState(count);
      renderPanel(getStickies(), getCurrentY());
      showToast(`📌 付箋を追加しました（${count}/5）`);
    }
  }
});

// backgroundからのクリア指示を受信
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CLEAR_STICKIES") {
    sessionStorage.removeItem(`websticky_${location.href}`);
    updateFloatButtonState(0);
    hidePanel();
    renderPanel([], 0);
  }
});

init();
console.info("[WebSticky] v3.0.0 loaded");
