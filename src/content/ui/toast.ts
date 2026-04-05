import "./styles/toast.css";

let toastEl: HTMLDivElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function ensureToast(): HTMLDivElement {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "websticky-toast";
    document.body.appendChild(toastEl);
  }
  return toastEl;
}

// トースト通知を表示（2秒後に自動非表示）
export function showToast(message: string): void {
  const el = ensureToast();
  el.textContent = message;
  el.classList.add("visible");

  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    el.classList.remove("visible");
  }, 2000);
}
