import "./styles/floatButton.css";
import type { Sticky } from "../../types";

const PETAL_ANGLES = [0, 72, 144, 216, 288];
const PETAL_PATH =
  "M 0,-7 C -6,-7 -15,-18 -13,-30 C -11,-40 -4,-50 0,-42 C 4,-50 11,-40 13,-30 C 15,-18 6,-7 0,-7 Z";

const POS_KEY = "websticky_pos";

let container: HTMLDivElement | null = null;

type SakuraCallbacks = {
  onCenterClick: () => void;
  onPetalClick: (scrollY: number) => void;
  onPetalDelete: (id: string) => void;
};

let _callbacks: SakuraCallbacks | null = null;
let suppressNextClick = false;

function loadPos(): { top: number; left: number } {
  try {
    const saved = localStorage.getItem(POS_KEY);
    if (saved) {
      const pos = JSON.parse(saved);
      // ウィンドウサイズが変わっても画面外に出ないようクランプ
      return {
        left: Math.max(0, Math.min(pos.left, window.innerWidth - 110)),
        top: Math.max(0, Math.min(pos.top, window.innerHeight - 110)),
      };
    }
  } catch {}
  return {
    left: window.innerWidth - 110,
    top: window.innerHeight - 110,
  };
}

function savePos(top: number, left: number): void {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify({ top, left }));
  } catch {}
}

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

// ドラッグ機能（setPointerCaptureを使わずdocumentレベルで処理）
function setupDrag(el: HTMLDivElement): void {
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;
  let dragging = false;

  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!dragging && Math.hypot(dx, dy) < 6) return;
    dragging = true;
    el.classList.add("ws-dragging");

    const newLeft = Math.max(0, Math.min(startLeft + dx, window.innerWidth - el.offsetWidth));
    const newTop = Math.max(0, Math.min(startTop + dy, window.innerHeight - el.offsetHeight));
    el.style.left = `${newLeft}px`;
    el.style.top = `${newTop}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    el.classList.remove("ws-dragging");

    if (dragging) {
      savePos(el.offsetTop, el.offsetLeft);
      dragging = false;
      suppressNextClick = true;
      setTimeout(() => { suppressNextClick = false; }, 100);
    }
  };

  el.addEventListener("mousedown", (e) => {
    // 右クリックはドラッグしない
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = el.offsetLeft;
    startTop = el.offsetTop;
    dragging = false;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

export function mountSakuraButton(callbacks: SakuraCallbacks): void {
  _callbacks = callbacks;

  container = document.createElement("div");
  container.id = "websticky-sakura";

  const pos = loadPos();
  container.style.top = `${pos.top}px`;
  container.style.left = `${pos.left}px`;

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

  container.querySelector(".ws-center")?.addEventListener("click", (e) => {
    if (suppressNextClick) return;
    e.stopPropagation();
    _callbacks?.onCenterClick();
  });

  svg.addEventListener("click", (e) => {
    if (suppressNextClick) return;
    if ((e.target as Element).closest(".ws-center")) return;
    const petal = (e.target as Element).closest(".ws-petal");
    if (!petal) return;
    const scrollY = petal.getAttribute("data-ws-scroll-y");
    if (scrollY !== null) _callbacks?.onPetalClick(Number(scrollY));
  });

  svg.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (suppressNextClick) return;
    const petal = (e.target as Element).closest(".ws-petal");
    if (!petal) return;
    const id = petal.getAttribute("data-ws-id");
    if (id) _callbacks?.onPetalDelete(id);
  });

  setupDrag(container);
  document.body.appendChild(container);
}

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
