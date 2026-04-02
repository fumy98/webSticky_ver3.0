# DESIGN — WebSticky

## アーキテクチャ

```
┌─────────────────────────────────┐
│         Chrome Browser          │
│                                 │
│  ┌──────────────────────────┐  │
│  │      Content Script      │  │
│  │  - ショートカット検知     │  │
│  │  - UIレンダリング        │  │
│  │  - スクロール制御        │  │
│  └───────────┬──────────────┘  │
│              │ chrome.storage   │
│  ┌───────────▼──────────────┐  │
│  │     Storage (session)    │  │
│  │  - 付箋データ保持        │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │    Background (SW)       │  │
│  │  - ナビゲーション検知    │  │
│  │  - 付箋クリア制御        │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## データ構造

```typescript
// 1枚の付箋
type Sticky = {
  id: string;        // ユニークID（crypto.randomUUID）
  scrollY: number;   // ページのY軸位置（px）
  createdAt: number; // 作成時刻（timestamp）
};

// ページごとの付箋データ（sessionStorageに保存）
type StickyStore = {
  url: string;       // 対象ページのURL
  stickies: Sticky[];
  currentY: number;  // 現在地のスクロール位置
};
```

## ストレージ戦略

- **sessionStorage**を使用（タブを閉じると消える）
- ブラウザバック・別ページ遷移で消える要件を満たすため
- リロードでは残る（sessionStorageはリロードで保持される）
- キー：`websticky_${url}`

## フォルダ構成

```
webSticky_ver3.0/
├── src/
│   ├── content/
│   │   ├── index.ts          # エントリーポイント
│   │   ├── stickyManager.ts  # 付箋の追加・削除・取得ロジック
│   │   ├── ui/
│   │   │   ├── floatButton.ts  # 右下の桜アイコン
│   │   │   ├── listPanel.ts    # 付箋リストパネル
│   │   │   └── styles/
│   │   │       ├── floatButton.css
│   │   │       └── listPanel.css
│   │   └── storage.ts        # sessionStorage操作
│   ├── background/
│   │   └── index.ts          # ナビゲーション検知・付箋クリア
│   └── types.ts              # 共通型定義
├── public/
│   ├── manifest.json
│   └── icons/
│       └── sakura.svg
├── docs/
│   ├── PRD.md
│   ├── DESIGN.md
│   └── TASKS.md
├── CLAUDE.md
├── README.md
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## UIコンポーネント責務

### floatButton
- 画面右下に固定表示
- クリックでlistPanelの表示/非表示を切り替え
- 付箋が0枚のときはグレーアウト

### listPanel
- 付箋一覧を表示（作成順）
- 「現在地」をリスト先頭に表示
- 各付箋に「ジャンプ」と「削除」ボタン
- 5枚上限時は追加ショートカットを無効化

## ナビゲーション検知（ライフサイクル）

- `chrome.webNavigation.onCommitted` でブラウザバック・ページ遷移を検知
- `transitionType === "reload"` の場合は付箋を消さない
- それ以外（`back_forward`, `link`, `typed` など）は sessionStorage をクリア
