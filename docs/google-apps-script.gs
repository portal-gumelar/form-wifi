const sheetName = 'Sheet1'
const scriptProp = PropertiesService.getScriptProperties()

function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  if (!activeSpreadsheet) {
    throw new Error("Gagal menemukan Spreadsheet. Pastikan Anda membuka Apps Script.");
  }
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    const sheet = doc.getSheetByName(sheetName)
    const action = e.parameter.action;
    const timestamp = e.parameter.timestamp || e.parameter.Timestamp;

    if (action === 'delete') {
      return deleteRow(sheet, timestamp);
    } else if (action === 'update') {
      return updateRow(sheet, e.parameter);
    } else {
      return addRow(sheet, e.parameter);
    }

  } catch(err) {
    return createResponse('error', err.toString());
  } finally {
    lock.releaseLock()
  }
}

function addRow(sheet, params) {
  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  let newHeadersFound = false;

  for (let key in params) {
    if (key !== 'action' && headers.indexOf(key) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(key);
      headers.push(key);
      newHeadersFound = true;
    }
  }
  
  if (newHeadersFound) {
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  const nextRow = sheet.getLastRow() + 1
  const newRow = headers.map(function(header) {
    return params[header] || ''
  })

  sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])
  return createResponse('success', 'Row added', nextRow);
}

function updateRow(sheet, params) {
  const timestamp = params.timestamp || params.Timestamp;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('Timestamp')] == timestamp) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) return createResponse('error', 'Record not found');

  for (let key in params) {
    if (key !== 'action' && headers.indexOf(key) !== -1) {
      const colIndex = headers.indexOf(key) + 1;
      sheet.getRange(rowIndex, colIndex).setValue(params[key]);
    }
  }

  return createResponse('success', 'Row updated');
}

function deleteRow(sheet, timestamp) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('Timestamp')] == timestamp) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex);
    return createResponse('success', 'Row deleted');
  }
  return createResponse('error', 'Record not found');
}

function createResponse(result, message, row) {
  return ContentService
    .createTextOutput(JSON.stringify({ 'result': result, 'message': message, 'row': row }))
    .setMimeType(ContentService.MimeType.JSON)
}
