# Google Sheet to vue-18n readme

[Sheet Sample URL](https://docs.google.com/spreadsheets/d/1XKshdm5fLKvtVEkAC8wDSi87sGRtQxuau1WxJbK7Z4k)

這是一個將 Google Sheet 轉為 vue-i18n 檔案的 parser by node.js

1. 轉檔前你需要兩個檔案：`credentials.json`、`token.json`

1. 首先是 `credentials.json`，[請到這個地方新增 OAuth 2.0 用戶端 ID 憑證並下載](https://console.cloud.google.com/apis/credentials)

1. 如果從來沒用過 Google API，一進到上面這個頁面會請你同意並繼續，然後請新增一個專案，名字隨意，可以辨別就好

1. 再來按下頁面最上方的`+建立憑證` -> `OAuth 用戶端 ID` -> 應用程式類型選「`電腦版應用程式`」，名稱隨意填寫，你看得懂就好 -> `建立`

1. 建立完成後會有 ClientID 與密鑰，這裡請關閉略過，關閉後會回到列表

1. 列表上「OAuth 2.0 用戶端 ID」的那一列最右邊有一個「下載」的按鈕，請點選它

1. 點選下載後的檔名很長一串，開頭是「client_secret_xxxxxxxxxx.json」，請重新命名成 `credentials.json`並丟到與 `index.js` 同資料夾下

1. 接下來請在終端機執行 `node index.js`，終端機因為找不到 `token.json`，代表尚未登入過，會跳出提示字元「Authorize this app by visiting this url: xxxxxxxx」，xxxxxx 的部份為 url，請把它複製下來貼到瀏覽器上，會請你登入 Google，要注意登入的帳號是要能存取 [Sheet Sample URL](https://docs.google.com/spreadsheets/d/1XKshdm5fLKvtVEkAC8wDSi87sGRtQxuau1WxJbK7Z4k)

1. 登入後會請你允許權限，權限的部份應該會是「查看您的 Google 試算表」的權限，確認無誤請按下「允許」

1. 允許後頁面會出現`授權碼`，請把`授權碼`複製下來貼到終端機裡按下 Enter，程式會自動產生 `token.json` 在資料夾裡，之後就不用再認證，就可以無限執行轉檔。

1. 認證完成之後就會開始抓資料並且轉成指定的檔案，成功應該會在終端機裡顯示「Write Success!」的訊息，轉檔完畢後可以利用 VSCode 的 git 變更內容裡看修改了什麼，方便掌握變動內容。

注意：`credential.json` 與 `token.json` 屬於機敏資料，切勿上傳至 github，目前已使用 `.gitignore` 略過它，但還是需要注意一下切勿不小心上傳它。如需在其他台電腦上執行本程式，請到[這裡](https://console.cloud.google.com/apis/credentials)重新下載並從步驟 6 開始

## 設定

#### index.js:
```javascript
const SPREADSHEET_ID = '1XKshdm5fLKvtVEkAC8wDSi87sGRtQxuau1WxJbK7Z4k'; // Spead Sheet ID on your sheet url
const SPREADSHEET_RANGE = 'Export'; // Export sheet name
const GROUPED_KEYS = ['SYSTEM', 'FORM']; // Used for combined keys
const I18N_FILEPATH = `src/i18n/{lang}/index.js`; // Path to export
```

## 疑難排解：

#### The API returned an error: Error: Google Sheets API has not been used in project 70450873061 before or it is disabled.
請到這裡開啟 Google Sheets API：https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=70450873061

#### Error: The translation data includes #REF!, please reorganize the sheet.)

如果轉檔過程中出現以下的錯誤訊息
(注意第一行的訊息像這樣：`Error: The translation data includes #REF!, please reorganize the sheet.`)

```
(node:10367) UnhandledPromiseRejectionWarning: Error: The translation data includes #REF!, please reorganize the sheet.
    at /Users/user/i18n-node/index.js:133:15
    at Array.map (<anonymous>)
    at /Users/user/i18n-node/index.js:131:10
    at Array.map (<anonymous>)
    at processSheet (/Users/user/i18n-node/index.js:127:22)
    at /Users/user/i18n-node/index.js:116:7
    at /Users/user/node_modules/googleapis-common/build/src/apirequest.js:49:53
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
(Use `node --trace-warnings ...` to show where the warning was created)
(node:10367) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
(node:10367) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

這是 google sheet 的 Export sheet 裡有包含 #REF! 的資料，請重拉 google sheet 的資料再重新執行指令即可。
