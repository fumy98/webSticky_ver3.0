import { addSticky, removeSticky, getStickies, updateCurrentY, getCurrentY, isMaxReached } from "./stickyManager";
import { mountFloatButton, updateFloatButtonState } from "./ui/floatButton";
import { mountListPanel, renderPanel, togglePanel } from "./ui/listPanel";

// UIを初期化
function init(): void {
  // フロートボタンをマウント
  mountFloatButton(() => {
    updateCurrentY();
    renderPanel(getStickies(), getCurrentY());
    togglePanel();
  });

  // リストパネルをマウント
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

  // 初期状態を反映
  updateFloatButtonState(getStickies().length);
}

// Alt+S ショートカットで付箋を追加
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "s") {
    if (isMaxReached()) {
      console.info("[WebSticky] 付箋は最大5枚まで追加できます");
      return;
    }
    const added = addSticky();
    if (added) {
      updateFloatButtonState(getStickies().length);
      console.info(`[WebSticky] 付箋を追加しました（${getStickies().length}/5）`);
    }
  }
});

// backgroundからのクリア指示を受信
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CLEAR_STICKIES") {
    sessionStorage.removeItem(`websticky_${location.href}`);
    updateFloatButtonState(0);
  }
});

init();
