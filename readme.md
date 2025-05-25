# Threads Marker

**Threads Marker** 是一個 Chrome 擴充功能，能在 [Threads](https://www.threads.com/) 網站上，為你指定的帳號加上標記，方便辨識。

## 功能特色

- 在 Threads 上自動標示你設定的帳號
- 支援自訂帳號名單，並可命名清單
- 標記會即時顯示於所有符合條件的用戶連結旁

## 安裝方式

1. 下載或 clone 此專案到本地資料夾
2. 開啟 Chrome，進入 `chrome://extensions/`
3. 開啟「開發人員模式」
4. 點擊「載入未封裝項目」，選擇本專案資料夾

## 使用說明

1. 點擊瀏覽器工具列上的 Threads Marker 圖示，開啟管理視窗
2. 在「帳號名單管理」區塊，每行輸入一個要標示的帳號（不需加 @）
3. 可為這份名單命名（選填）
4. 點擊「💾 儲存名單」即可生效
5. 若要清空名單，點擊「🗑️ 清空名單」

## 檔案結構

- [`manifest.json`](manifest.json)：Chrome 擴充功能設定檔
- [`content.js`](content.js)：內容腳本，負責在 Threads 頁面標記帳號
- [`popup.html`](popup.html)：管理名單的彈出視窗 HTML
- [`popup.js`](popup.js)：彈出視窗的互動邏輯
- [`style.css`](style.css)：標記樣式
- `icon16.png`, `icon48.png`, `icon128.png`：擴充功能圖示

## 權限說明

- `storage`：儲存帳號名單
- `activeTab`：與當前分頁互動
- `host_permissions`：僅作用於 `https://www.threads.com/*`

## 注意事項

- 帳號名單不區分大小寫
- 只會標記 Threads 網站上的帳號連結
- 本專案僅提供帳號比對並標記的功能，各使用者自行輸入帳號清單，開發者無法得知來源，也不為任何清單背書

---

個人時間與技術有限，這只是一個基本功能的底，歡迎大家自由叉回去發展