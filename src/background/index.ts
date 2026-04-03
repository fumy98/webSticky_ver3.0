// ナビゲーション検知：リロード以外で付箋をクリア
chrome.webNavigation.onCommitted.addListener((details) => {
  // メインフレームのみ対象
  if (details.frameId !== 0) return;

  const { transitionType } = details;

  // リロードは付箋を残す
  if (transitionType === "reload") return;

  // ブラウザバック・ページ遷移はcontent scriptへクリア指示
  chrome.tabs.sendMessage(details.tabId, { type: "CLEAR_STICKIES" }).catch(() => {
    // content scriptが未ロードの場合は無視
  });
});

// content scriptからのクリア要求を受信（念のため）
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CLEAR_STICKIES") {
    // 現状はcontent script側でsessionStorageを直接クリアするため不要
  }
});
