// ページのスクロールコンテナを検出して抽象化するユーティリティ
// ChatGPT等、window ではなく独自divでスクロールするSPAに対応

function findScrollContainer(): Element {
  // documentが直接スクロールする通常のページ
  if (document.documentElement.scrollHeight > window.innerHeight + 10) {
    return document.documentElement;
  }
  // 最大スクロール量を持つdiv/main等を探す
  let best: Element = document.documentElement;
  let bestScrollable = 0;
  for (const el of document.querySelectorAll<Element>("div, main, section, article")) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") {
      const scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable > bestScrollable) {
        bestScrollable = scrollable;
        best = el;
      }
    }
  }
  return best;
}

export function getScrollY(): number {
  const c = findScrollContainer();
  return c === document.documentElement ? window.scrollY : (c as HTMLElement).scrollTop;
}

export function scrollToY(top: number): void {
  const c = findScrollContainer();
  if (c === document.documentElement) {
    window.scrollTo({ top, behavior: "smooth" });
  } else {
    c.scrollTo({ top, behavior: "smooth" });
  }
}
