// Google Apps Script — deploy as Web App to log AE Scorecard access
// The site sends a GET request with query params: email, action, ua

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // If params present, log the access
  if (e && e.parameter && e.parameter.email) {
    sheet.appendRow([
      new Date().toISOString(),
      e.parameter.email,
      e.parameter.action || "unknown",
      e.parameter.ua || ""
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({status: "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date().toISOString(),
    data.email,
    data.action,
    data.userAgent
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({status: "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this once to set up the sheet headers
function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow(["Timestamp", "Email", "Action", "User Agent"]);
  sheet.getRange("1:1").setFontWeight("bold");
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 400);
}
