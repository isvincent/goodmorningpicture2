/** 早安圖集錦：只讀指定資料夾，不更改任何分享權限。 */
const FOLDER_ID = '1xQUTmUYkkBAPtz58GFzbz0eE6qorRKUl';

function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  // 只接受網站產生的 callback，避免任意 JavaScript 注入。
  if (callback && !/^morning_\d+_\d+$/.test(callback)) {
    return ContentService.createTextOutput(JSON.stringify({error:'Invalid callback'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  let result;
  try {
    const files = DriveApp.getFolderById(FOLDER_ID).getFiles();
    const items = [];
    while (files.hasNext()) {
      const file = files.next();
      // SVG 等格式不列入；HEIC 請先轉換為 JPEG 或 PNG。
      if (!/^image\/(png|jpeg|gif|webp|bmp|avif)$/.test(file.getMimeType())) continue;
      items.push({
        id: file.getId(),
        name: file.getName().replace(/\.[^.]+$/, ''),
        created: file.getDateCreated().toISOString()
      });
    }
    items.sort((a,b) => b.created.localeCompare(a.created));
    result = {updatedAt: new Date().toISOString(), items: items};
  } catch (err) {
    console.error(err);
    result = {error: 'Unable to read gallery. Check the folder ID and script authorization.'};
  }
  // U+2028 / U+2029 與 < 進行轉義，維持 JSONP 安全性及相容性。
  const json = JSON.stringify(result).replace(/</g,'\\u003c')
    .replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback ? callback + '(' + json + ');' : json)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

/** 先在編輯器手動執行以授權及確認資料夾可讀。 */
function testGallery() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  console.log('可讀取資料夾：' + folder.getName());
  const files = folder.getFiles();
  let count = 0;
  while (files.hasNext()) { const f = files.next(); if (f.getMimeType().startsWith('image/')) count++; }
  console.log('圖片數量：' + count);
}
