import "./styles/floatButton.css";

// 桜の花びらSVGアイコン
const SAKURA_SVG = `
<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(16,16)">
    <ellipse cx="0" cy="-7" rx="4" ry="6.5" fill="#f48fb1" transform="rotate(0)"/>
    <ellipse cx="0" cy="-7" rx="4" ry="6.5" fill="#f48fb1" transform="rotate(72)"/>
    <ellipse cx="0" cy="-7" rx="4" ry="6.5" fill="#f48fb1" transform="rotate(144)"/>
    <ellipse cx="0" cy="-7" rx="4" ry="6.5" fill="#f48fb1" transform="rotate(216)"/>
    <ellipse cx="0" cy="-7" rx="4" ry="6.5" fill="#f48fb1" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="3.5" fill="#fff" stroke="#f48fb1" stroke-width="1.2"/>
  </g>
</svg>`;

let btn: HTMLButtonElement | null = null;
let onClickHandler: (() => void) | null = null;

// ボタンをDOMに追加
export function mountFloatButton(onClick: () => void): void {
  onClickHandler = onClick;

  btn = document.createElement("button");
  btn.id = "websticky-float-btn";
  btn.innerHTML = SAKURA_SVG;
  btn.title = "WebSticky";
  btn.addEventListener("click", onClick);

  document.body.appendChild(btn);
}

// 付箋数に応じてグレーアウト切り替え
export function updateFloatButtonState(count: number): void {
  if (!btn) return;
  if (count === 0) {
    btn.classList.add("disabled");
  } else {
    btn.classList.remove("disabled");
  }
}
