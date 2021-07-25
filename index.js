/* eslint-disable no-console */
/**
 * @license
 * Copyright Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// [START sheets_quickstart]
const fs = require('fs');
const path = require('path');
const fsextra = require('fs-extra');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(__dirname, 'token.json');

const SPREADSHEET_ID = '1XKshdm5fLKvtVEkAC8wDSi87sGRtQxuau1WxJbK7Z4k';
const SPREADSHEET_RANGE = 'Export';
const GROUPED_KEYS = ['SYSTEM', 'FORM'];
const I18N_FILEPATH = `src/i18n/{lang}/index.js`;

// Load client secrets from a local file.
fs.readFile(path.join(__dirname, 'credentials.json'), (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          'Error while trying to retrieve access token',
          err,
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: SPREADSHEET_ID,
      range: SPREADSHEET_RANGE,
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      processSheet(rows);
    },
  );
}
// [END sheets_quickstart]

function processSheet(rows) {
  const langs = Object.keys(rows[0])
    .filter((item) => item > 0)
    .map((item) => rows[0][item]);

  Object.keys(langs).map((langsKey) => {
    let objs = {};
    const langItem = parseInt(langsKey);
    const filePath = I18N_FILEPATH.replace('{lang}', langs[langsKey]);
    rows.map((items, key) => {
      if (items[0] === '#REF!') {
        throw new Error(
          'The translation data includes #REF!, please reorganize the sheet.',
        );
      }
      if (key > 0) {
        const splitKey = items[0].split('.');
        if (GROUPED_KEYS.includes(splitKey[0])) {
          const groupKey = splitKey.shift();
          objs[groupKey] = {
            ...objs[groupKey],
            [splitKey.join('.')]: items[langItem + 1],
          };
        } else {
          objs[items[0]] = items[langItem + 1];
        }
      }
    });
    processFiles(objs, filePath);
  });
}

function processFiles(objs, filePath) {
  const json = `// prettier-ignore\nexport default ${JSON.stringify(
    objs,
    null,
    2,
  )};\n`
    .replace(/\"/g, "'")
    .replace(/\\\'/g, '"');
  fsextra.ensureFileSync(filePath);
  fs.writeFile(filePath, json, (err) => {
    if (err) return console.error(err);
  });
  console.log(`${filePath}: Write Success!`);
}

module.exports = {
  SCOPES,
  listMajors,
};
