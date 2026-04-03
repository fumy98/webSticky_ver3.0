import "./styles/listPanel.css";
import type { Sticky } from "../../types";

let panel: HTMLDivElement | null = null;
let isVisible = false;

type PanelCallbacks = {
  onJump: (scrollY: number) => void;
  onDelete: (id: string) => void;
  onCurrentJump: (scrollY: number) => void;
};

// パネルをDOMに追加
export function mountListPanel(callbacks: PanelCallbacks): void {
  panel = document.createElement("div");
  panel.id = "websticky-panel";
  panel.classList.add("hidden");
  document.body.appendChild(panel);

  // パネル外クリックで閉じる
  document.addEventListener("click", (e) => {
    if (!panel || !isVisible) return;
    if (!panel.contains(e.target as Node)) {
      hidePanel();
    }
  });

  // callbacksをパネルに紐付け（再描画時に使うため保持）
  (panel as HTMLDivElement & { _callbacks?: PanelCallbacks })._callbacks = callbacks;
}

// パネルの内容を再描画
export function renderPanel(stickies: Sticky[], currentY: number): void {
  if (!panel) return;
  const callbacks = (panel as HTMLDivElement & { _callbacks?: PanelCallbacks })._callbacks;
  if (!callbacks) return;

  const items = [
    // 現在地
    `<li class="websticky-item">
      <span class="websticky-item-label current">📍 現在地</span>
      <button class="websticky-jump-btn" data-current-y="${currentY}">戻る</button>
    </li>`,
    // 付箋リスト
    ...stickies.map((s, i) => `
      <li class="websticky-item">
        <span class="websticky-item-label">📌 付箋 ${i + 1}（${Math.round(s.scrollY)}px）</span>
        <button class="websticky-jump-btn" data-scroll-y="${s.scrollY}">移動</button>
        <button class="websticky-delete-btn" data-id="${s.id}" title="削除">×</button>
      </li>
    `),
  ].join("");

  panel.innerHTML = `
    <div class="websticky-panel-header">📋 付箋リスト（${stickies.length}/5）</div>
    <ul class="websticky-list">${items}</ul>
  `;

  // イベント登録
  panel.querySelectorAll<HTMLButtonElement>("[data-scroll-y]").forEach((btn) => {
    btn.addEventListener("click", () => {
      callbacks.onJump(Number(btn.dataset.scrollY));
    });
  });

  panel.querySelectorAll<HTMLButtonElement>("[data-current-y]").forEach((btn) => {
    btn.addEventListener("click", () => {
      callbacks.onCurrentJump(Number(btn.dataset.currentY));
    });
  });

  panel.querySelectorAll<HTMLButtonElement>("[data-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      callbacks.onDelete(btn.dataset.id!);
    });
  });
}

export function togglePanel(): void {
  if (isVisible) {
    hidePanel();
  } else {
    showPanel();
  }
}

export function showPanel(): void {
  if (!panel) return;
  panel.classList.remove("hidden");
  isVisible = true;
}

export function hidePanel(): void {
  if (!panel) return;
  panel.classList.add("hidden");
  isVisible = false;
}
