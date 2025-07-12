// Main Apps Script file for Cleaning Management System
// This script handles HTTP requests and coordinates with other service files

// This script is bound to the Google Sheet, so we use getActiveSpreadsheet()

// Main entry points for web app
function doGet(e) {
  const action = e.parameter.action;

  try {
    switch (action) {
      case "getTasks":
        return createResponse(TaskService.getTasks(e.parameter));
      case "getCleaners":
        return createResponse(CleanerService.getCleaners());
      case "getProducts":
        return createResponse(ProductService.getProducts());
      default:
        return createResponse({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    console.error("doGet error:", error);
    return createResponse({ error: error.toString() }, 500);
  }
}

// Handle preflight OPTIONS requests for CORS
function doOptions(e) {
  return createResponse({}, 200);
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return createResponse({ error: "Invalid JSON" }, 400);
  }

  const action = e.parameter.action;

  try {
    switch (action) {
      case "createTask":
        return createResponse(TaskService.createTask(data));
      case "updateTask":
        return createResponse(TaskService.updateTask(data));
      case "assignTask":
        return createResponse(
          TaskService.assignTask(data.taskId, data.cleanerId)
        );
      case "updateTaskStatus":
        return createResponse(
          TaskService.updateTaskStatus(data.taskId, data.status, data.comments)
        );
      case "requestProducts":
        return createResponse(
          ProductService.requestProducts(data.taskId, data.productRequests)
        );
      case "importReservations":
        return createResponse(TaskService.importReservations());
      case "getMonthlyReport":
        return createResponse(
          ReportService.getMonthlyReport(data.month, data.year, data.cleanerId)
        );
      default:
        return createResponse({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    console.error("doPost error:", error);
    return createResponse({ error: error.toString() }, 500);
  }
}

// Helper function to create JSON response with CORS headers
function createResponse(data, status = 200) {
  const response = {
    success: status < 400,
    data: data,
    timestamp: new Date().toISOString(),
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setStatusCode(status)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization,X-Requested-With",
      "Access-Control-Max-Age": "86400",
    });
}

// Helper function to get spreadsheet
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

// Helper function to get sheet by name
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  return ss.getSheetByName(sheetName);
}

// Helper function to generate unique ID
function generateId() {
  return (
    "task_" +
    new Date().getTime() +
    "_" +
    Math.random().toString(36).substr(2, 9)
  );
}

// Test function to verify setup
function testSetup() {
  try {
    const ss = getSpreadsheet();
    console.log("Spreadsheet found:", ss.getName());

    const sheets = [
      "reservations",
      "tasks",
      "cleaners",
      "products",
      "product_requests",
    ];
    sheets.forEach((sheetName) => {
      const sheet = getSheet(sheetName);
      if (sheet) {
        console.log(
          `Sheet '${sheetName}' found with ${sheet.getLastRow()} rows`
        );
      } else {
        console.log(`Sheet '${sheetName}' NOT FOUND - please create it`);
      }
    });

    return "Setup test completed - check logs";
  } catch (error) {
    console.error("Setup test failed:", error);
    return "Setup test failed: " + error.toString();
  }
}
