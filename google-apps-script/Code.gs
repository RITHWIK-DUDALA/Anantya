/**
 * JANMASHTAMI 2025 — AVV CHENNAI
 * Google Apps Script — Sheets Backend
 *
 * HOW TO DEPLOY:
 * 1. Open https://script.google.com and create a new project
 * 2. Paste this entire file into the editor
 * 3. Click ▶ Deploy → New Deployment
 * 4. Type: Web App
 *    Execute as: Me
 *    Who has access: Anyone
 * 5. Click Deploy → Authorise → Copy the Web App URL
 * 6. Paste the URL into CONFIG.googleSheetsWebhook in src/config/config.js
 *
 * SHEET COLUMNS (auto-created on first run):
 * Timestamp | FormType | Name | Email | Phone | Dept | Year | Role | Games | Amount | PaymentID | Status
 */

var SHEET_NAME = 'Registrations'; // ← Change if you want a different sheet name

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();

    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.formType     || '',
      data.name         || '',
      data.email        || '',
      data.phone        || '',
      data.dept         || '',
      data.year         || '',
      data.role         || '',
      data.games        || '',
      data.amount       || 0,
      data.paymentId    || '',
      data.status       || (data.formType === 'paid' ? 'paid' : 'free'),
    ]);

    return jsonResponse({ status: 'ok', message: 'Registration saved.' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message }, 500);
  }
}

// Allow pre-flight OPTIONS requests (CORS)
function doGet() {
  return jsonResponse({ status: 'ok', message: 'Janmashtami 2025 Sheets API is live.' });
}

function getOrCreateSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add header row
    sheet.appendRow([
      'Timestamp', 'Form Type', 'Name', 'Email', 'Phone',
      'Dept/Branch', 'Year', 'Role', 'Games Selected',
      'Amount Paid (₹)', 'Payment ID', 'Status',
    ]);
    // Style header row
    var header = sheet.getRange(1, 1, 1, 12);
    header.setFontWeight('bold');
    header.setBackground('#6B9BD2');
    header.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(obj, code) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
