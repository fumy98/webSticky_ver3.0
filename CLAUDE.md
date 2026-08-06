# WebSticky — CLAUDE.md

Webページに付箋を貼り付け、重要箇所へ素早く戻れるChrome拡張機能（Manifest V3）。
このファイルはAIアシスタント向けに、コードベースの構造・開発フロー・規約をまとめたもの。

## プロジェクト概要

**解決する課題**
- 生成AIとの会話で、気になった回答が後続のやり取りで埋もれてしまう
- 縦長LPなど、後でじっくり見返したい箇所がある

**コアな考え方**
- 付箋は「そのページのセッション中だけ」有効な一時的マーカー
- 保存先は `sessionStorage`（URLごとにキー分割）。永続化はしない
- ChatGPTのような独自スクロールコンテナを持つSPAでも動くようにスクロールを抽象化

## 技術スタック

- TypeScript（`strict` / `noUnusedLocals` / `noUnusedParameters`）
- Chrome Extensions API（Manifest V3）
- ビルド：Vite + `vite-plugin-web-extension`
- スタイル：素のCSS（各TSモジュールから `import "./styles/xxx.css"` で読み込み）
- 依存ランタイムライブラリなし（バニラTS）

## コマンド

```bash
npm install       # 依存インストール
npm run dev       # vite build --watch（ファイル変更を監視して dist/ を再ビルド）
npm run build     # 本番ビルド（dist/ を出力）
```

**Chromeへの読み込み**
1. `npm run build`
2. `chrome://extensions` → デベロッパーモードON
3. 「パッケージ化されていない拡張機能を読み込む」→ `dist/` を選択

> `dist/` はビルド成果物でありコミット対象外（`.gitignore`）。ソースを変更したら再ビルドして拡張をリロードする。

## アーキテクチャ

### エントリーポイントと2つのコンテキスト

拡張は2つの実行コンテキストで動く。

| コンテキスト | ファイル | 役割 |
|------|------|------|
| Content script | `src/content/index.ts` | ページに注入。UI表示・ショートカット・付箋の状態管理 |
| Service worker (background) | `src/background/index.ts` | ナビゲーション検知・ツールバーアイコン処理 |

Content scriptは `run_at: document_start` で注入される。これはChatGPT等のSPAがキーイベントを奪う前に `Alt+S` をキャプチャするため（`keydown` を `capture: true` で登録）。DOM依存のUI初期化は `DOMContentLoaded` 後に行う。

### ディレクトリ構成

```
src/
├── content/
│   ├── index.ts            # Content scriptのエントリ。イベント配線・状態のオーケストレーション
│   ├── stickyManager.ts    # 付箋の追加/削除/取得/上限チェック（ドメインロジック）
│   ├── storage.ts          # sessionStorage の read/write/clear（永続層）
│   ├── scroll.ts           # スクロールコンテナ検出（SPA対応）。getScrollY / scrollToY
│   └── ui/
│       ├── floatButton.ts  # 右下の桜アイコン（＝現在のUI本体）。花びら＝付箋
│       ├── listPanel.ts    # ⚠️ 未使用のレガシー。index.ts から import されていない
│       ├── toast.ts        # トースト通知
│       └── styles/*.css    # floatButton / listPanel / toast のスタイル
├── background/
│   └── index.ts            # webNavigation 監視・action クリック処理
└── types.ts                # Sticky / StickyStore の共通型
```

### データモデル（`src/types.ts`）

```ts
type Sticky = { id: string; scrollY: number; createdAt: number };
type StickyStore = { url: string; stickies: Sticky[]; currentY: number };
```

- `sessionStorage` にキー `websticky_<url>` で `StickyStore` をJSON保存（`storage.ts`）
- 1ページ最大5枚（`MAX_STICKIES`、`stickyManager.ts`）
- `currentY` は「付箋へ飛ぶ前にいた現在地」を1つだけ記憶する
- ドラッグで移動した桜アイコンの位置は別途 `localStorage` の `websticky_pos` に永続化

### UIの実像（重要）

READMEやストア文言では「桜アイコンをクリック → リスト表示」と説明しているが、**実装は花びらベース**になっている。`floatButton.ts` が現在のUI本体で、`listPanel.ts` は配線されていない（`index.ts` から未import）。

桜アイコンの操作（SVG）：
- **花びらを左クリック** → その付箋の `scrollY` へスムーズスクロール（初回は現在地を保存）
- **花びらを右クリック（contextmenu）** → その付箋を削除
- **中心（花芯）をクリック** → 保存した現在地（`currentY`）へ戻る
- **アイコンをドラッグ** → 位置を移動（`localStorage` に保存、リサイズ時は右下へリセット）
- 花びらは付箋の枚数ぶんだけ表示される（`updateSakuraPetals` が最大5枚を出し分け）

ドラッグとクリックの競合は `suppressNextClick`（ドラッグ直後100ms）で吸収している。

### キーボードショートカット（`index.ts` / `manifest.json`）

| キー | 動作 |
|------|------|
| `Alt+S`（Mac: `Option+S`） | 現在のスクロール位置に付箋を追加（最大5枚。超過時はトースト） |
| `Alt+D`（Mac: `Option+D`） | ページの全付箋を削除 |

> `manifest.json` の `commands` は登録されているが、実際のハンドリングは content script の `keydown`（capture）で行っている。SPAより先にイベントを捕まえる必要があるため。

### ツールバーアイコン

`chrome.action.onClicked`（background）→ content script に `TOGGLE_VISIBILITY` を送信し、桜UIコンテナ（`#websticky-sakura`）の表示/非表示を切り替える。

### 付箋のライフサイクルとクリア処理

| 操作 | 付箋 | 実装 |
|------|------|------|
| リロード | **残る** | `transitionType === "reload"` / `navigation.type === "reload"` を除外 |
| ブラウザバック | 消える | 下記のクリア処理でsessionStorageを削除 |
| 別ページへ遷移 | 消える | 同上 |

クリア判定は二重化されている（どちらか一方でも動くようにするフォールバック構成）：
1. **background**：`chrome.webNavigation.onCommitted`（メインフレームのみ）でreload以外なら `CLEAR_STICKIES` を送信
2. **content**：`pageshow` イベントで `PerformanceNavigationTiming.type` を見てreload以外ならクリア

`websticky_` プレフィックスのキーを走査して削除する。

### スクロール抽象化（`scroll.ts`）

`findScrollContainer()` が実際にスクロールする要素を検出する：
- 通常ページ → `document.documentElement`（`window.scrollY` / `window.scrollTo`）
- ChatGPT等、独自divでスクロールするSPA → `overflow-y: auto|scroll` かつ最大スクロール量を持つ要素を探して `scrollTop` / `scrollTo` を使う

付箋位置の取得・移動は必ず `getScrollY()` / `scrollToY()` 経由で行うこと（`window.scrollY` を直接触らない）。

## コーディング規約

- **コメント・ドキュメント：日本語**
- 命名：camelCase（変数・関数）、PascalCase（クラス・型）、ファイル名はcamelCase
- `any` 型：原則禁止（型が必要な箇所は明示。DOM拡張は交差型 `HTMLDivElement & { _x?: T }` などで対応）
- スタイルはCSSファイルに分離し、対応するTSモジュールから `import` する
- コミットメッセージ：Conventional Commits（**英語**）
  - 例：`feat: add sticky note shortcut`、`fix: clear notes on navigation`、`docs: update store listing`
- 状態管理は関数ベースでシンプルに保つ。過剰な抽象化・クラス化はしない

## 開発方針（Claudeへの指示）

- AI駆動開発：フラットなパートナーとしてディスカッションしながら進める
- **どんどん実装する**：設計の承認待ちはしない
- **判断に迷ったらベストな方を選んで実装し、後から報告する**
- シンプルさを優先し、過剰な抽象化はしない
- ドキュメント（README / ストア文言）と実装が食い違う箇所（例：リストパネル vs 花びらUI）に気づいたら、実装に合わせて修正するか、明示的に報告する

## ドキュメント

`docs/` に補助資料がある：
- `PRD.md` — プロダクト要求
- `DESIGN.md` — 設計メモ
- `TASKS.md` / `FIXES.md` — タスク・修正履歴
- `store_listing.md` / `privacy_policy.html` — Chrome Web Store公開用
