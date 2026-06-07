// ツールバーアイコンクリックで花UIの表示/非表示をトグル
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_VISIBILITY" }).catch(() => {});
  }
});

// キーボードショートカット（ブラウザレベルで処理するのでSPAでも動く）
// tabはページにフォーカスがない場合undefinedになるためfallback付き
chrome.commands.onCommand.addListener(async (command, tab) => {
  const targetId = tab?.id ?? (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]?.id;
  if (!targetId) return;
  if (command === "add-sticky") {
    chrome.tabs.sendMessage(targetId, { type: "ADD_STICKY" }).catch(() => {});
  } else if (command === "clear-stickies") {
    chrome.tabs.sendMessage(targetId, { type: "CLEAR_ALL_STICKIES" }).catch(() => {});
  }
});

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
