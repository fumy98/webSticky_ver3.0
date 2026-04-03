// 1枚の付箋
export type Sticky = {
  id: string;        // ユニークID（crypto.randomUUID）
  scrollY: number;   // ページのY軸位置（px）
  createdAt: number; // 作成時刻（timestamp）
};

// ページごとの付箋データ（sessionStorageに保存）
export type StickyStore = {
  url: string;        // 対象ページのURL
  stickies: Sticky[];
  currentY: number;   // 現在地のスクロール位置
};
