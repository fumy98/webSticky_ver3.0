# TASKS — WebSticky

## 進め方

- 上から順に実装する
- 完了したタスクは `[x]` にチェックを入れる
- 各タスクは独立して動作確認できる単位に分割

---

## Phase 1: プロジェクトセットアップ

- [ ] **T01** — `npm init` + Vite + TypeScript の初期設定
- [ ] **T02** — `vite-plugin-web-extension` の導入・`vite.config.ts` 作成
- [ ] **T03** — `manifest.json` の作成（MV3、権限設定）
- [ ] **T04** — `tsconfig.json` の設定
- [ ] **T05** — `src/types.ts` に `Sticky` / `StickyStore` 型を定義

## Phase 2: ストレージ

- [ ] **T06** — `src/content/storage.ts` の実装
  - `getStore(url)` — 付箋データの取得
  - `saveStore(store)` — 付箋データの保存
  - `clearStore(url)` — 付箋データの削除

## Phase 3: 付箋マネージャー

- [ ] **T07** — `src/content/stickyManager.ts` の実装
  - `addSticky()` — 現在のscrollYに付箋を追加（5枚上限チェック）
  - `removeSticky(id)` — 指定IDの付箋を削除
  - `getStickies()` — 付箋一覧を取得
  - `updateCurrentY()` — 現在地を更新

## Phase 4: UI

- [ ] **T08** — `floatButton.ts` の実装
  - 桜アイコンを画面右下に表示
  - クリックでパネルの開閉
  - 付箋0枚時はグレーアウト
- [ ] **T09** — `floatButton.css` のスタイリング
- [ ] **T10** — `listPanel.ts` の実装
  - 付箋リストの表示
  - 現在地をリスト先頭に表示
  - 各付箋の「ジャンプ」「削除」ボタン
- [ ] **T11** — `listPanel.css` のスタイリング

## Phase 5: ショートカット・イベント

- [ ] **T12** — `src/content/index.ts` の実装
  - `Alt+S` ショートカットの検知
  - floatButton・listPanel の初期化・マウント

## Phase 6: バックグラウンド

- [ ] **T13** — `src/background/index.ts` の実装
  - `chrome.webNavigation.onCommitted` でナビゲーション検知
  - リロード以外で sessionStorage をクリア

## Phase 7: 統合・動作確認

- [ ] **T14** — Chrome に拡張機能を読み込んで動作確認
  - 付箋の追加（5枚上限）
  - リストパネルの表示・ジャンプ・削除
  - リロードで付箋が残ること
  - ブラウザバック・遷移で付箋が消えること
- [ ] **T15** — README.md の「フォルダ構成」「セットアップ」を更新
