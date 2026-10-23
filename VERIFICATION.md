# 驗證記錄

2026-10-23 製作時完成：

- 已透過 Google Drive 連接工具讀取指定資料夾，取得 18 張圖片的檔名、ID、建立時間。
- JavaScript 語法與 JSON 格式檢查通過，PWA 圖示尺寸正確。
- Chromium 桌機與 390px 手機檢查通過，手機無水平溢出。
- UI 測試通過：初始 12 張與分批顯示 18 張、搜尋、收藏與重新載入後保存、收藏篩選、圖片 dialog、鍵盤切換、隨機選圖。
- 七項設定控制均存在；已測試語言、字體、主題、裝置與版面實際變化。全螢幕和 Web Audio 的裝置實際行為仍須在使用者瀏覽器確認。
- 以模擬 Apps Script JSONP 合約驗證即時清單、新增與移除圖片。
- 以模擬 DriveApp 驗證 Apps Script 的 MIME 篩選、JSON/JSONP、callback 格式限制、權限錯誤回應。
- 以模擬 Service Worker Cache API 驗證外殼安裝、GitHub 子目錄路徑、離線首頁回退、API 不進快取。

尚待部署後驗證：

- 目前執行環境的 Google Drive 縮圖載入失敗，未能確認匿名訪客的圖片權限或實際圖片呈現。連接工具能讀取不等於公開訪客能讀取。
- 尚未替使用者部署 Google Apps Script 或發布 GitHub Pages；沒有可宣稱已上線的公開網站。
- 實際 Apps Script 授權、公開 /exec 端點、Drive 縮圖、系統分享、全螢幕、音效及 PWA 安裝／離線圖片，需完成 README 部署步驟後在目標瀏覽器驗收。
