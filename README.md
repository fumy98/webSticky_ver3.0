<!-- omit in toc -->
# WebSticky

Webページに付箋を貼り付け、重要箇所へ素早く戻れるブラウザ拡張機能。

<!-- omit in toc -->
## 目次

- [概要](#概要)
- [機能](#機能)
- [使用技術](#使用技術)
- [使用方法](#使用方法)
- [フォルダ構成](#フォルダ構成)
- [セットアップ](#セットアップ)

## 概要

長尺LPの閲覧やチャットボットとの会話中に、重要な箇所へ戻ることが難しい問題を解決します。
付箋をWeb上に貼ることで、直感的に該当箇所へジャンプできます。
付箋は一時的なものであり、リロードでは付箋は消えません。
ブラウザバックや、サイトが移り変わると付箋は消えます。

## 機能

- `Option+S`（Mac） / `Alt+S`（Windows）で現在のスクロール位置に付箋を追加（最大5枚）
- 画面右下の桜アイコンをクリックして付箋リストを開く
- リストの付箋をクリックするとその位置へスムーズスクロール
- 現在地（スクロール位置）もリストに表示
- リストから付箋を個別に削除

## 使用技術

- TypeScript
- Chrome Extensions API (Manifest V3)
- Vite + vite-plugin-web-extension

## 使用方法

**付箋の追加**
`Option+S`（Mac） / `Alt+S`（Windows）を押すと、現在のスクロール位置に付箋が追加されます。
付箋は1ページあたり最大5枚まで追加できます。

**付箋リスト**
画面右下の桜アイコンをクリックするとリストパネルが開きます。
リスト内の付箋をクリックするとその位置へジャンプし、削除ボタンで個別に削除できます。

**付箋のライフサイクル**

| 操作 | 付箋の状態 |
|------|-----------|
| リロード | 残る |
| ブラウザバック | 消える |
| 別ページへ遷移 | 消える |

## フォルダ構成

```
webSticky_ver3.0/
├── src/
│   ├── content/
│   │   ├── index.ts          # エントリーポイント
│   │   ├── stickyManager.ts  # 付箋の追加・削除・取得ロジック
│   │   ├── storage.ts        # sessionStorage操作
│   │   └── ui/
│   │       ├── floatButton.ts  # 右下の桜アイコン
│   │       ├── listPanel.ts    # 付箋リストパネル
│   │       ├── toast.ts        # トースト通知
│   │       └── styles/
│   │           ├── floatButton.css
│   │           ├── listPanel.css
│   │           └── toast.css
│   ├── background/
│   │   └── index.ts          # ナビゲーション検知・付箋クリア
│   └── types.ts              # 共通型定義
├── public/
│   ├── manifest.json
│   └── icons/
│       └── sakura.svg
├── docs/
│   ├── PRD.md
│   └── DESIGN.md
├── CLAUDE.md
├── README.md
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## セットアップ

1. リポジトリをクローンして依存パッケージをインストール

   ```bash
   git clone <repository-url>
   cd webSticky_ver3.0
   npm install
   ```

2. 拡張機能をビルド

   ```bash
   npm run build
   ```

3. Chromeで拡張機能を読み込む
   - `chrome://extensions` を開く
   - 右上の「デベロッパーモード」をオンにする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `dist/` フォルダを選択する

4. 開発時はウォッチモードを利用

   ```bash
   npm run dev
   ```
