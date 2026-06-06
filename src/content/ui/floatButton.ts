import "./styles/floatButton.css";
import type { Sticky } from "../../types";

// 花びらの回転角度（上から時計回りに72°ずつ）
const PETAL_ANGLES = [0, 72, 144, 216, 288];

// 花びらSVGパス（上向き）
// 根本を細くとがらせ、外側へ急に広がり→丸みを帯びた先端へ
const PETAL_PATH =
  "M 0,-14 C -4,-14 -18,-20 -18,-31 C -18,-40 -8,-45 0,-42 C 8,-45 18,-40 18,-31 C 18,-20 4,-14 0,-14 Z";

let container: HTMLDivElement | null = null;

type SakuraCallbacks = {
  onCenterClick: () => void;
  onPetalClick: (scrollY: number) => void;
  onPetalDelete: (id: string) => void;
};

let _callbacks: SakuraCallbacks | null = null;

// おしべのSVGを生成（白い線と点）
function buildStamens(): string {
  return Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const x1 = (Math.cos(a) * 5).toFixed(2);
    const y1 = (Math.sin(a) * 5).toFixed(2);
    const x2 = (Math.cos(a) * 11).toFixed(2);
    const y2 = (Math.sin(a) * 11).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.85)" stroke-width="0.8"/>
            <circle cx="${x2}" cy="${y2}" r="1.3" fill="white"/>`;
  }).join("");
}

// 桜UIをDOMに追加
// - 中央の黄色い種: 現在地へ戻る（クリック）
// - 花びら: 保存した各位置へジャンプ（クリック）、削除（右クリック）
// - 付箋が増えるごとに花びらが1枚ずつ表示される（最大5枚）
export function mountSakuraButton(callbacks: SakuraCallbacks): void {
  _callbacks = callbacks;

  container = document.createElement("div");
  container.id = "websticky-sakura";

  const petalsHtml = PETAL_ANGLES.map(
    (angle, i) =>
      `<g class="ws-petal" data-ws-index="${i}" style="display:none" transform="rotate(${angle})">
        <path d="${PETAL_PATH}" class="ws-petal-path"/>
      </g>`
  ).join("");

  container.innerHTML = `
    <svg id="websticky-sakura-svg" viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">
      ${petalsHtml}
      <g class="ws-center">
        <circle cx="0" cy="0" r="14" class="ws-center-circle"/>
        ${buildStamens()}
      </g>
    </svg>
  `;

  const svg = container.querySelector("#websticky-sakura-svg")!;

  // 中央クリック（現在地へ戻る）
  container.querySelector(".ws-center")?.addEventListener("click", (e) => {
    e.stopPropagation();
    _callbacks?.onCenterClick();
  });

  // 花びらクリック（付箋位置へジャンプ）
  svg.addEventListener("click", (e) => {
    if ((e.target as Element).closest(".ws-center")) return;
    const petal = (e.target as Element).closest(".ws-petal");
    if (!petal) return;
    const scrollY = petal.getAttribute("data-ws-scroll-y");
    if (scrollY !== null) _callbacks?.onPetalClick(Number(scrollY));
  });

  // 花びら右クリック（付箋を削除）
  svg.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const petal = (e.target as Element).closest(".ws-petal");
    if (!petal) return;
    const id = petal.getAttribute("data-ws-id");
    if (id) _callbacks?.onPetalDelete(id);
  });

  document.body.appendChild(container);
}

// 付箋データに合わせて花びらを更新
export function updateSakuraPetals(stickies: Sticky[]): void {
  if (!container) return;
  container.querySelectorAll(".ws-petal").forEach((petal, i) => {
    if (i < stickies.length) {
      (petal as SVGGElement).style.display = "";
      petal.setAttribute("data-ws-id", stickies[i].id);
      petal.setAttribute("data-ws-scroll-y", String(stickies[i].scrollY));
      petal.setAttribute("title", `付箋${i + 1}（${Math.round(stickies[i].scrollY)}px）`);
    } else {
      (petal as SVGGElement).style.display = "none";
      petal.removeAttribute("data-ws-id");
      petal.removeAttribute("data-ws-scroll-y");
    }
  });
}
