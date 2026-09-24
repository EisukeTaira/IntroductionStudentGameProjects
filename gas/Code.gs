const CONFIG = Object.freeze({
  sheetName: '作品',
  headerRow: 1,
  dataStartRow: 2,
  maxManagedRows: 500,
  arraySeparator: '｜',
  objectSeparator: '：',
  exportFileName: 'games.json'
});

const HEADERS = Object.freeze([
  'published', 'id', 'title', 'summary', 'description', 'features', 'genre',
  'players', 'playTime', 'controls', 'supportedOs', 'systemRequirements',
  'teamName', 'grade', 'productionYear', 'version', 'fileSize', 'updatedAt',
  'downloadUrl', 'thumbnail', 'mainImage', 'screenshots', 'videoUrl',
  'launchInstructions', 'notes', 'virusCheckedAt', 'pickup', 'pickupOrder',
  'pickupStartDate', 'pickupEndDate', 'rightsChecked', 'downloadCheckedAt',
  'lastPickupDate'
]);

const REQUIRED_FOR_PUBLIC = Object.freeze([
  'id', 'title', 'summary', 'description', 'features', 'genre', 'players',
  'controls', 'supportedOs', 'teamName', 'grade', 'productionYear', 'version',
  'fileSize', 'updatedAt', 'launchInstructions'
]);

const PUBLIC_FIELDS = new Set([
  'published', 'id', 'title', 'summary', 'description', 'features', 'genre',
  'players', 'playTime', 'controls', 'supportedOs', 'systemRequirements',
  'teamName', 'grade', 'productionYear', 'version', 'fileSize', 'updatedAt',
  'downloadUrl', 'thumbnail', 'mainImage', 'screenshots', 'videoUrl',
  'launchInstructions', 'notes', 'virusCheckedAt', 'pickup', 'pickupOrder',
  'pickupStartDate', 'pickupEndDate'
]);

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('作品データ')
    .addItem('新しい作品を追加', 'showGameForm')
    .addItem('空の下書き行を追加', 'addDraftRow')
    .addSeparator()
    .addItem('シートを初期設定', 'setupGameSheet')
    .addSeparator()
    .addItem('入力内容を検証', 'validateFromMenu')
    .addItem('公開用JSONを出力', 'exportJsonFromMenu')
    .addToUi();
}

function showGameForm() {
  const html = HtmlService.createTemplateFromFile('GameForm')
    .evaluate()
    .setTitle('新しい作品を追加');
  SpreadsheetApp.getUi().showSidebar(html);
}

function addDraftRow() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error(`「${CONFIG.sheetName}」シートがありません。`);
  const row = Math.max(sheet.getLastRow() + 1, CONFIG.dataStartRow);
  sheet.getRange(row, HEADERS.indexOf('published') + 1).setValue(false);
  sheet.getRange(row, HEADERS.indexOf('pickup') + 1).setValue(false);
  sheet.getRange(row, HEADERS.indexOf('rightsChecked') + 1).setValue(false);
  sheet.getRange(row, HEADERS.indexOf('productionYear') + 1).setValue(new Date().getFullYear());
  sheet.getRange(row, HEADERS.indexOf('updatedAt') + 1).setValue(new Date()).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(row, HEADERS.indexOf('version') + 1).setValue('1.0.0');
  sheet.getRange(row, HEADERS.indexOf('id') + 1).activate();
}

function addGameFromForm(form) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error(`「${CONFIG.sheetName}」シートがありません。`);

  const id = String(form.id || '').trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('作品IDは半角英小文字、数字、ハイフンのみで入力してください。');
  const existingIds = sheet.getRange(CONFIG.dataStartRow, HEADERS.indexOf('id') + 1, Math.max(sheet.getLastRow() - 1, 1)).getDisplayValues().flat();
  if (existingIds.includes(id)) throw new Error(`作品ID「${id}」はすでに使用されています。`);

  const required = ['title', 'summary', 'description', 'genre', 'players', 'supportedOs', 'teamName', 'grade', 'productionYear'];
  const missing = required.filter((field) => isBlank_(form[field]));
  if (missing.length) throw new Error(`必須項目が未入力です：${missing.join(', ')}`);

  const valueByHeader = {
    published: false,
    id,
    title: form.title,
    summary: form.summary,
    description: form.description,
    features: normalizeMultiline_(form.features),
    genre: form.genre,
    players: form.players,
    playTime: form.playTime,
    controls: normalizeMultiline_(form.controls),
    supportedOs: normalizeMultiline_(form.supportedOs),
    systemRequirements: form.systemRequirements,
    teamName: form.teamName,
    grade: form.grade,
    productionYear: Number(form.productionYear),
    version: form.version || '1.0.0',
    fileSize: form.fileSize,
    updatedAt: new Date(),
    downloadUrl: form.downloadUrl,
    thumbnail: form.thumbnail,
    mainImage: form.mainImage,
    screenshots: normalizeMultiline_(form.screenshots),
    videoUrl: form.videoUrl,
    launchInstructions: form.launchInstructions,
    notes: form.notes,
    pickup: false,
    rightsChecked: false
  };

  const row = Math.max(sheet.getLastRow() + 1, CONFIG.dataStartRow);
  sheet.getRange(row, 1, 1, HEADERS.length).setValues([HEADERS.map((header) => valueByHeader[header] ?? '')]);
  ['updatedAt'].forEach((field) => sheet.getRange(row, HEADERS.indexOf(field) + 1).setNumberFormat('yyyy-mm-dd'));
  sheet.getRange(row, HEADERS.indexOf('title') + 1).activate();
  SpreadsheetApp.flush();
  return { row, title: String(form.title) };
}

function normalizeMultiline_(value) {
  if (isBlank_(value)) return '';
  return String(value).split(/\r?\n/).map((item) => item.trim()).filter(Boolean).join(CONFIG.arraySeparator);
}
  
function setupGameSheet() {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    sheet = spreadsheet.getActiveSheet();
    sheet.setName(CONFIG.sheetName);
  }

  ensureSheetSize_(sheet);
  sheet.getRange(CONFIG.headerRow, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#2563EB')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setWrap(true);

  sheet.getRange(CONFIG.dataStartRow, 1, CONFIG.maxManagedRows - 1, HEADERS.length)
    .setVerticalAlignment('top')
    .setWrap(true);

  setCheckboxes_(sheet, ['published', 'pickup', 'rightsChecked']);
  setListValidation_(sheet, 'genre', ['アクション', 'アドベンチャー', 'パズル', 'シューティング', 'シミュレーション', '探索', '協力', 'その他']);
  setListValidation_(sheet, 'players', ['1人用', '2人用', '1～2人用', '複数人用']);
  setListValidation_(sheet, 'grade', ['1年', '2年', '3年', '4年', 'その他']);
  setNumberValidation_(sheet, 'productionYear', 2000, 2100);
  setNumberValidation_(sheet, 'pickupOrder', 1, 3, true);
  setDateFormat_(sheet, ['updatedAt', 'virusCheckedAt', 'pickupStartDate', 'pickupEndDate', 'downloadCheckedAt', 'lastPickupDate']);

  const widths = {
    published: 85, id: 150, title: 200, summary: 280, description: 340,
    features: 300, genre: 140, players: 110, playTime: 120, controls: 260,
    supportedOs: 180, systemRequirements: 260, teamName: 160, grade: 90,
    productionYear: 110, version: 100, fileSize: 110, updatedAt: 120,
    downloadUrl: 300, thumbnail: 260, mainImage: 260, screenshots: 300,
    videoUrl: 260, launchInstructions: 320, notes: 300, virusCheckedAt: 130,
    pickup: 85, pickupOrder: 110, pickupStartDate: 130, pickupEndDate: 130,
    rightsChecked: 110, downloadCheckedAt: 140, lastPickupDate: 130
  };
  HEADERS.forEach((header, index) => sheet.setColumnWidth(index + 1, widths[header] || 140));
  sheet.setRowHeight(1, 42);
  const existingFilter = sheet.getFilter();
  if (existingFilter) existingFilter.remove();
  sheet.getRange(1, 1, CONFIG.maxManagedRows, HEADERS.length).createFilter();
  sheet.getRange('A1').activate();
  SpreadsheetApp.getUi().alert('作品管理シートを初期設定しました。');
}

function validateFromMenu() {
  const result = validateGameData_();
  showValidationResult_(result, '入力内容の検証');
}

function exportJsonFromMenu() {
  const result = validateGameData_();
  if (result.errors.length) {
    showValidationResult_(result, 'JSONを出力できません');
    return;
  }

  const payload = JSON.stringify({ games: result.games }, null, 2);
  const template = HtmlService.createTemplateFromFile('DownloadDialog');
  template.fileName = CONFIG.exportFileName;
  template.jsonBase64 = Utilities.base64Encode(payload, Utilities.Charset.UTF_8);
  template.gameCount = result.games.length;
  SpreadsheetApp.getUi().showModalDialog(
    template.evaluate().setWidth(500).setHeight(300),
    '公開用JSONを出力'
  );
}

function validateGameData_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.sheetName);
  if (!sheet) return { errors: [{ row: 0, field: 'sheet', message: `「${CONFIG.sheetName}」シートがありません。` }], games: [] };

  const lastRow = sheet.getLastRow();
  const lastColumn = Math.max(sheet.getLastColumn(), HEADERS.length);
  const values = lastRow >= 1 ? sheet.getRange(1, 1, lastRow, lastColumn).getValues() : [];
  const headers = (values[0] || []).map((value) => String(value).trim());
  const errors = [];
  const headerMap = {};
  headers.forEach((header, index) => { if (header) headerMap[header] = index; });

  HEADERS.forEach((header) => {
    if (!(header in headerMap)) errors.push({ row: 1, field: header, message: '必須の列がありません。' });
  });
  if (errors.length) return { errors, games: [] };

  clearValidationMarks_(sheet, lastRow);
  const games = [];
  const ids = new Map();
  let activePickupCount = 0;
  const today = startOfDay_(new Date());

  values.slice(1).forEach((row, offset) => {
    const rowNumber = offset + 2;
    if (row.every((cell) => cell === '' || cell == null || cell === false)) return;
    const raw = {};
    HEADERS.forEach((header) => { raw[header] = row[headerMap[header]]; });
    const published = toBoolean_(raw.published);
    if (!published) return;

    REQUIRED_FOR_PUBLIC.forEach((field) => {
      if (isBlank_(raw[field])) errors.push({ row: rowNumber, field, message: '公開作品では必須です。' });
    });

    const id = String(raw.id || '').trim();
    if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) errors.push({ row: rowNumber, field: 'id', message: '半角英小文字、数字、ハイフンのみで入力してください。' });
    if (id) {
      if (ids.has(id)) errors.push({ row: rowNumber, field: 'id', message: `${ids.get(id)}行目と重複しています。` });
      else ids.set(id, rowNumber);
    }

    const year = Number(raw.productionYear);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) errors.push({ row: rowNumber, field: 'productionYear', message: '西暦4桁で入力してください。' });

    ['updatedAt', 'virusCheckedAt', 'pickupStartDate', 'pickupEndDate', 'downloadCheckedAt', 'lastPickupDate'].forEach((field) => {
      if (!isBlank_(raw[field]) && !toIsoDate_(raw[field])) errors.push({ row: rowNumber, field, message: '有効な日付を入力してください。' });
    });

    ['downloadUrl', 'thumbnail', 'mainImage', 'videoUrl'].forEach((field) => {
      if (!isBlank_(raw[field]) && !isHttpsOrRelativeUrl_(raw[field])) errors.push({ row: rowNumber, field, message: 'https:// URLまたは相対パスを入力してください。' });
    });
    parseList_(raw.screenshots).forEach((url) => {
      if (!isHttpsOrRelativeUrl_(url)) errors.push({ row: rowNumber, field: 'screenshots', message: `URLまたは相対パスが不正です：${url}` });
    });

    if (!toBoolean_(raw.rightsChecked)) errors.push({ row: rowNumber, field: 'rightsChecked', message: '公開前に権利確認が必要です。' });
    if (raw.downloadUrl && isBlank_(raw.downloadCheckedAt)) errors.push({ row: rowNumber, field: 'downloadCheckedAt', message: '配布URLがある場合は確認日が必要です。' });

    const pickup = toBoolean_(raw.pickup);
    const pickupOrder = raw.pickupOrder === '' ? null : Number(raw.pickupOrder);
    if (pickup && (!Number.isInteger(pickupOrder) || pickupOrder < 1 || pickupOrder > 3)) errors.push({ row: rowNumber, field: 'pickupOrder', message: 'ピックアップ作品では1～3を入力してください。' });
    const start = toDate_(raw.pickupStartDate);
    const end = toDate_(raw.pickupEndDate);
    if (start && end && start > end) errors.push({ row: rowNumber, field: 'pickupEndDate', message: '掲載終了日は開始日以降にしてください。' });
    if (pickup && (!start || today >= start) && (!end || today <= end)) activePickupCount += 1;

    games.push(buildPublicGame_(raw));
  });

  if (activePickupCount > 3) errors.push({ row: 0, field: 'pickup', message: `現在有効なピックアップ作品が${activePickupCount}件あります。3件以内にしてください。` });
  markErrors_(sheet, headerMap, errors);
  return { errors, games };
}

function buildPublicGame_(raw) {
  const result = {};
  HEADERS.forEach((field) => {
    if (!PUBLIC_FIELDS.has(field)) return;
    let value = raw[field];
    if (['published', 'pickup'].includes(field)) value = toBoolean_(value);
    else if (['productionYear', 'pickupOrder'].includes(field)) value = isBlank_(value) ? null : Number(value);
    else if (['features', 'supportedOs', 'screenshots'].includes(field)) value = parseList_(value);
    else if (field === 'controls') value = parseControls_(value);
    else if (field.endsWith('At') || field.endsWith('Date')) value = toIsoDate_(value);
    else value = typeof value === 'string' ? value.trim() : value;
    if (value === '' || value == null || (Array.isArray(value) && value.length === 0)) return;
    result[field] = value;
  });
  return result;
}

function parseList_(value) {
  if (isBlank_(value)) return [];
  return String(value).split(CONFIG.arraySeparator).map((item) => item.trim()).filter(Boolean);
}

function parseControls_(value) {
  return parseList_(value).map((item) => {
    const index = item.indexOf(CONFIG.objectSeparator);
    return index < 0 ? { key: item, action: '' } : { key: item.slice(0, index).trim(), action: item.slice(index + 1).trim() };
  });
}

function showValidationResult_(result, title) {
  const ui = SpreadsheetApp.getUi();
  if (!result.errors.length) {
    ui.alert(title, `エラーはありません。公開対象は${result.games.length}作品です。`, ui.ButtonSet.OK);
    return;
  }
  const lines = result.errors.slice(0, 20).map((error) => `${error.row ? `${error.row}行目` : '全体'}［${error.field}］${error.message}`);
  if (result.errors.length > 20) lines.push(`ほか${result.errors.length - 20}件`);
  ui.alert(title, lines.join('\n'), ui.ButtonSet.OK);
}

function markErrors_(sheet, headerMap, errors) {
  errors.forEach((error) => {
    if (!error.row || !(error.field in headerMap)) return;
    const cell = sheet.getRange(error.row, headerMap[error.field] + 1);
    cell.setBackground('#FEE2E2').setNote(error.message);
  });
}

function clearValidationMarks_(sheet, lastRow) {
  if (lastRow < 2) return;
  const range = sheet.getRange(2, 1, lastRow - 1, HEADERS.length);
  range.setBackground(null).clearNote();
}

function setCheckboxes_(sheet, fields) {
  fields.forEach((field) => sheet.getRange(CONFIG.dataStartRow, HEADERS.indexOf(field) + 1, CONFIG.maxManagedRows - 1).insertCheckboxes());
}

function setListValidation_(sheet, field, values) {
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sheet.getRange(CONFIG.dataStartRow, HEADERS.indexOf(field) + 1, CONFIG.maxManagedRows - 1).setDataValidation(rule);
}

function setNumberValidation_(sheet, field, min, max, allowBlank) {
  const rule = SpreadsheetApp.newDataValidation().requireNumberBetween(min, max).setAllowInvalid(false).build();
  sheet.getRange(CONFIG.dataStartRow, HEADERS.indexOf(field) + 1, CONFIG.maxManagedRows - 1).setDataValidation(rule);
}

function setDateFormat_(sheet, fields) {
  fields.forEach((field) => sheet.getRange(CONFIG.dataStartRow, HEADERS.indexOf(field) + 1, CONFIG.maxManagedRows - 1).setNumberFormat('yyyy-mm-dd'));
}

function ensureSheetSize_(sheet) {
  if (sheet.getMaxRows() < CONFIG.maxManagedRows) sheet.insertRowsAfter(sheet.getMaxRows(), CONFIG.maxManagedRows - sheet.getMaxRows());
  if (sheet.getMaxColumns() < HEADERS.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
}

function isBlank_(value) { return value === '' || value == null; }
function toBoolean_(value) { return value === true || String(value).toLowerCase() === 'true' || String(value) === '1'; }
function startOfDay_(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function toDate_(value) { const iso = toIsoDate_(value); return iso ? new Date(`${iso}T00:00:00`) : null; }
function toIsoDate_(value) {
  if (isBlank_(value)) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone() || 'Asia/Tokyo', 'yyyy-MM-dd');
}
function isHttpsOrRelativeUrl_(value) {
  const text = String(value).trim();
  return /^https:\/\//i.test(text) || /^(?:\.\.?\/)?[A-Za-z0-9_./-]+$/.test(text);
}
