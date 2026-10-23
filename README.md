# ☀️ 早安圖集錦

繁體中文、明亮溫暖的 Google Drive 早安圖展示網站。首頁 `index.html`，原生 HTML / CSS / JavaScript，無需 npm、API 金鑰或編譯。建議架構：**GitHub Pages 託管前端 + Google Apps Script 讀取指定 Drive 資料夾**。

> 本套件尚未替你部署 Apps Script 或發布 GitHub。已附 2026/10/23 讀取的 18 張圖片清單；未設定 API 時會清楚標示「初始清單」。初始清單不是自動同步。完成下列設定後才會自動更新。圖片本體仍由 Drive 提供，需要瀏覽者有權存取。

## 完整檔案架構

```text
morning-gallery/
├── index.html                 # 首頁與兩個原生 dialog
├── styles.css                 # 手機／平板／桌機、亮暗主題、動畫
├── app.js                     # 圖集、搜尋、收藏、語系、七項設定、JSONP 同步
├── config.js                  # 唯一必填：Apps Script /exec 網址
├── initial-data.json           # 初次預覽用的 18 張真實圖片清單
├── manifest.webmanifest       # PWA 安裝資訊（相對路徑支援 GitHub 子目錄）
├── sw.js                      # 離線外殼、最多 40 筆看過的圖片請求
├── .nojekyll                  # GitHub Pages 直接提供靜態檔案
├── assets/
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-maskable.png
├── apps-script/
│   ├── Code.gs                # 貼到 Google Apps Script；不放在前端執行
│   └── appsscript.json         # Apps Script 專案設定與唯讀 Drive scope
├── VERIFICATION.md            # 已完成測試與部署後待驗證項目
└── README.md
```

## 1. 準備 Google Drive 圖片

資料夾：<https://drive.google.com/drive/folders/1xQUTmUYkkBAPtz58GFzbz0eE6qorRKUl>

1. 使用擁有此資料夾或有讀取權限的 Google 帳戶操作。
2. 若要讓所有訪客不用登入就看得到圖片，請在 Drive 對這個圖集資料夾設定「共用 → 一般存取權 → 知道連結的任何人 → 檢視者」。**這會讓圖集中的圖片可被取得連結的人瀏覽，請先確認這是你要公開的內容。** 程式不會自行更改任何分享權限。
3. 確認個別圖片沒有額外限制，並用無痕視窗測試一張原圖能否直接開啟。
4. 圖片名稱就是圖說與搜尋文字，例如 `願你今天也被溫柔以待.png`。網站隱藏最後一段副檔名。
5. 支援 PNG、JPEG、GIF、WebP、BMP、AVIF；HEIC 請先轉成 JPEG / PNG。只讀取指定資料夾的**直接子檔案**，不遞迴讀取子資料夾。

## 2. 建立 Google Apps Script 即時資料端點

1. 開啟 <https://script.google.com/>，按「新專案」，命名為「早安圖集 API」。
2. 把 `apps-script/Code.gs` 的全部內容貼入編輯器的 `Code.gs`，取代預設函式。`FOLDER_ID` 已填好指定資料夾。
3. 左側齒輪「專案設定」→ 勾選「在編輯器中顯示 appsscript.json 資訊清單檔案」，回到編輯器，把套件中的 `apps-script/appsscript.json` 內容貼進同名檔案並儲存。這將 Drive 授權限於唯讀。
4. 上方函式選單選 `testGallery`，按「執行」，依 Google 畫面授權，執行記錄應顯示資料夾名稱與圖片數量。Google 可能提示這是你自己的未驗證專案；請先確認程式內容與帳戶，再依畫面繼續。不要授權不明專案。
5. 按「部署 → 新增部署 → 選取類型：網頁應用程式」。
6. 「執行身分」選**我**，「誰可以存取」選**所有人**（包含未登入者），再按部署。若學校／公司政策沒有這個選項，需請管理員協助或使用允許公開部署的帳戶；僅限組織的部署不能供公開網站使用。
7. 複製**網頁應用程式網址**，應長得像 `https://script.google.com/macros/s/你的部署ID/exec`。使用 `/exec`，不要使用 `/dev`。
8. 在無痕視窗開啟該網址，應看到 `{"updatedAt":"...","items":[...]}`，不是登入畫面或錯誤。測試帶參數 `?callback=morning_1_2`，應得到 `morning_1_2({...});`。
9. 用文字編輯器開啟網站的 `config.js`，填入：

```js
window.GALLERY_CONFIG = Object.freeze({
  apiUrl: 'https://script.google.com/macros/s/你的部署ID/exec',
  refreshMinutes: 5,
  pageSize: 12
});
```

端點以腳本擁有者身分讀取圖集，並向任何可連線的訪客公開檔名、檔案 ID、加入時間。只放預定公開的圖集內容；不要把它改成私人文件的資料夾。網頁只接受 `script.google.com/macros/s/.../exec` 端點，使用經格式限制的 JSONP callback 跨網域取得資料。**請只填你自己建立並信任的部署網址**，因為 JSONP 會在頁面執行端點傳回的程式碼。Apps Script 的 ContentService 無法自行添加一般 API 的 CORS headers，因此沒有使用容易遇到 CORS 問題的跨來源 fetch。

### 每天增加圖片時

直接將新圖片加入同一個 Drive 資料夾，並用描述文字命名。無須重跑 `testGallery`、無須時間觸發器、無須重新部署網站。頁面開啟、回到頁面、恢復連線、按「更新圖集」，以及頁面可見時每 5 分鐘會重新取得清單。以 Drive 建立時間排序，日期依臺灣時間顯示。未開啟網頁時不在背景輪詢。

修改 Apps Script 程式後：部署 → 管理部署 → 鉛筆 → 版本選「新版本」→ 部署，可保留相同 `/exec` 網址。單純新增圖片不需要這個步驟。

## 3. 上傳 GitHub 並開啟 GitHub Pages

1. 登入 <https://github.com/> → 「＋ → New repository」，名稱建議 `morning-gallery`，可使用免費帳戶的公開 repository。
2. 解壓縮本套件。進入 `morning-gallery` 資料夾，先完成 `config.js` 設定。
3. 到新 repository → 「Add file → Upload files」，上傳**資料夾裡面的所有檔案與 assets、apps-script 子資料夾**。首頁 `index.html` 必須位於 repository 根目錄，不要再包一層 `morning-gallery/`。`.nojekyll` 是隱藏檔，請一併上傳；此站沒有 Jekyll 特殊目錄，漏傳通常仍可運作。
4. 按「Commit changes」。
5. 「Settings → Pages → Build and deployment → Source」選 **Deploy from a branch**。
6. Branch 選 `main`、目錄選 `/(root)`，按 Save。
7. 等待 GitHub Actions / Pages 部署成功，開啟 `https://你的帳號.github.io/morning-gallery/`。這是範例網址，請使用 GitHub 實際顯示的網站連結。
8. 檢查圖片、搜尋與「已連接即時圖集」文字，再用手機開啟測試。

熟悉 Git 的使用者可在解壓縮後的網站目錄執行（先替換帳號與儲存庫）：

```sh
git init
git add .
git commit -m "Create morning gallery PWA"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/morning-gallery.git
git push -u origin main
```

此套件沒有任何 Google 存取權杖或密碼。Apps Script 網址是公開資料端點，不是秘密金鑰。不要把 Google 憑證、OAuth token 或私密金鑰放進 GitHub。

## 4. 網站功能與操作

- 全部圖片／我的收藏：收藏儲存在目前瀏覽器，不會同步至其他裝置。
- 搜尋：依原始圖片檔名文字搜尋。切換英文只翻譯介面，不翻譯原圖文字或原始圖說。
- 排序：最新加入、最早加入、名稱；每批 12 張，按「顯示更多」繼續載入。
- 點圖放大、上一張／下一張、鍵盤左右鍵與 Esc。圖片以 contain 顯示，保留完整圖中文字。
- 「給我一份驚喜」從所有已載入的圖片隨機挑選。
- 分享：支援系統分享時開啟分享面板，否則複製 Drive 原圖連結。這是**連結分享**，不會直接把圖片檔案送到通訊軟體。
- 「開啟原圖／下載」前往 Drive 原圖頁面，再使用 Drive 下載功能，避免跨網域下載限制。
- 小巧的太陽與花朵插畫、浮動動畫。設定「減少動態效果」的使用者不會看到動畫。

「⚙️ 顯示與操作設定」包含七項：

| 設定 | 選項／效果 |
| --- | --- |
| 全螢幕 | 開啟／關閉，以瀏覽器 Fullscreen API 操作，不儲存；Esc 或系統退出後同步狀態 |
| 音效 | 開啟／關閉，預設關閉；點擊後以 Web Audio 產生短音，不自動播放背景音樂 |
| 裝置 | 自動／手機／平板／電腦，調整版面最大寬度及欄數；仍依實際視窗寬度防止溢出 |
| 版面 | 自動／直式／橫式，調整圖集欄位與圖片容器；不強制旋轉實體螢幕 |
| 語言 | 繁體中文／英文，介面即時更新，原圖與圖說保留原文 |
| 字體 | 縮小 18px／標準 20px／放大 24px 基準字級，標題與內文依比例變化 |
| 色系 | 跟隨系統／亮色／暗色，可即時跟隨系統變更 |

字體基準是 18 / 20 / 24px；日期與輔助標籤小於基準，主要圖說、控制按鈕與內文保持可閱讀尺寸。系統不支援全螢幕時會提示使用瀏覽器選單，iOS、嵌入式瀏覽器等可能限制此功能。

## 5. PWA 安裝與離線

1. 網站部署到 **HTTPS** 後先開啟一次，讓 Service Worker 建立離線外殼。不要直接雙擊 `file://.../index.html`，這樣不能正常載入 JSON / Service Worker。
2. Android Chrome／桌機 Chrome 或 Edge：按網站底部「安裝到裝置」，有安裝提示時完成；沒有提示時從瀏覽器選單選「安裝應用程式」。能否出現安裝提示由瀏覽器判定。
3. iPhone / iPad：Safari 開啟網站 → 分享 → 加入主畫面。
4. 離線可開啟網站外殼、已儲存的圖說與收藏；**只有瀏覽過且快取成功的圖片可能可看**。最多儲存 40 筆圖片請求（縮圖與大圖各占一筆）。不會預先下載整個圖集，也不保證所有 Drive 圖片離線可用。
5. 即時清單失敗時顯示「無法取得最新清單」，不假裝資料最新。瀏覽器可能因儲存空間或私人瀏覽模式清除快取／設定。
6. 發布新版時把 `sw.js` 的 `VERSION`（例如 `morning-v1`）改成 `morning-v2` 再一起上傳。新版本在舊分頁關閉後啟用；若畫面尚未更新，關閉所有舊分頁再重開。

## 6. 常見問題

**只有文字，沒有圖片？** 先在無痕視窗開啟「原圖」。確認任何知道連結的人可檢視、圖片未刪除、沒有下載／存取限制。Drive 的 thumbnail 連結屬外部服務，可能因流量、配額、瀏覽器或 Google 政策失敗。網站會保留圖說與原圖入口；大量流量時建議改用正式圖片儲存／CDN。

**一直顯示初始清單？** `config.js` 的 `apiUrl` 是空白。完成 Apps Script 部署並填好 URL，再將檔案上傳 GitHub。設定後狀態應變成「已連接即時圖集」。

**顯示無法取得最新清單？** 確認 `/exec` 在無痕視窗顯示 JSON、部署允許所有人、已使用具資料夾權限的帳戶授權、不是 `/dev` 網址；也可能是配額或網路問題。

**新圖不出現？** 確認圖片在直接子資料夾層級、格式受支援、分享權限正常。清除搜尋／切回「全部圖片」／按更新；圖片多時按「顯示更多」。檔案名稱更動也會在下次同步更新。

**資料很多時？** 此版本以 DriveApp 逐一列出檔案，前端分批渲染，不等於後端分頁。Google Apps Script 有每次執行時間、同時執行與每日配額，需參考當前帳戶限制。數千張以上或多人高頻存取，建議增加後端清單快取、真正分頁或改用靜態同步清單／CDN；本版本未實作這些擴充。

**可否只放在 Apps Script？** 這個套件讓 Apps Script 作為資料 API，首頁請放 GitHub Pages。Apps Script HtmlService 的 iframe 與 service worker 限制不適合作為本套 PWA 的安裝來源。若只需要 Apps Script 網頁，可另外改成 HtmlService 版本，但不能直接得到本套獨立來源的 PWA 功能。

**收藏不見？** 收藏保存在同裝置、同瀏覽器、同網域的 localStorage；清除網站資料、換網址、換手機不會保留。Safari 私密模式或儲存被封鎖時只保留目前工作階段。

## 7. 本機預覽

在網站目錄執行 Python 3：

```sh
python -m http.server 8080
```

再開啟 <http://localhost:8080/>。預設顯示初始清單，圖片需連網並有公開存取權。本套 Service Worker 只在 HTTPS 啟用，正式 GitHub Pages 上線後再驗證 PWA 安裝。

## 驗收清單

- 用無痕視窗確認即時端點和一張原圖無需登入。
- 上傳一張測試圖片、更新圖集，確認檔名成為圖說；移除該圖再確認清單同步移除。
- 搜尋、排序、收藏／重新載入、隨機、放大左右鍵、分享與原圖入口。
- 手機／平板／桌機及直橫版設定、繁中／英文、三段字體、三種色系。
- 全螢幕（支援的瀏覽器）、音效開關，使用者點擊後才有短音。
- HTTPS 下安裝到主畫面；先線上瀏覽幾張，再離線重開，確認離線提示與已快取內容。

圖片著作權屬原權利人。程式不添加新的圖片授權，分享前請確認你有使用權。
