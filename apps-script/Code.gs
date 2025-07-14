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
      case "getTaskHistory":
        return createResponse(EventService.getTaskHistory(e.parameter.taskId));
      case "getTaskComments":
        return createResponse(CommentService.getTaskComments(e.parameter.taskId, e.parameter.commentType));
      case "getTaskRejections":
        return createResponse(RejectionService.getTaskRejections(e.parameter.taskId));
      case "getTaskProposals":
        return createResponse(ProposalService.getTaskProposals(e.parameter.taskId));
      case "getPendingProposals":
        return createResponse(ProposalService.getPendingProposals());
      case "getRecentChanges":
        return createResponse(EventService.getRecentChanges(e.parameter.hoursBack));
      case "getTaskTimings":
        return createResponse(TimingService.getTaskTimings(e.parameter.taskId));
      case "getTimingsByUser":
        return createResponse(TimingService.getTimingsByUser(e.parameter.userId, e.parameter.daysBack));
      case "getTaskProductUsage":
        return createResponse(ProductUsageService.getTaskProductUsage(e.parameter.taskId));
      case "getProductUsageByUser":
        return createResponse(ProductUsageService.getProductUsageByUser(e.parameter.userId, e.parameter.daysBack));
      default:
        return createResponse(
          {
            error:
              "Invalid action. Supported actions: getTasks, getCleaners, getProducts, getTaskHistory, getTaskComments, getTaskRejections, getTaskProposals, getPendingProposals, getRecentChanges, getTaskTimings, getTimingsByUser, getTaskProductUsage, getProductUsageByUser",
          },
          400
        );
    }
  } catch (error) {
    console.error("doGet error:", error);
    return createResponse(
      { error: "Internal server error: " + error.message },
      500
    );
  }
}

// Handle preflight OPTIONS requests for CORS - simplified approach
function doOptions(e) {
  return ContentService.createTextOutput("");
}

function doPost(e) {
  let data;

  // Try to get data from form parameters first (URLSearchParams)
  if (e.parameter && Object.keys(e.parameter).length > 1) {
    // More than just 'action'
    data = parseFormData(e.parameter);
  } else if (e.postData && e.postData.contents) {
    // Handle form data (application/x-www-form-urlencoded)
    try {
      const formData = parseUrlEncoded(e.postData.contents);
      data = formData;
    } catch (error) {
      console.error("Failed to parse form data:", error);
      return createResponse({ error: "Invalid form data format" }, 400);
    }
  } else {
    return createResponse({ error: "No data provided in request" }, 400);
  }

  const action = e.parameter.action;

  try {
    switch (action) {
      case "createTask":
        return createResponse(TaskService.createTask(data));
      case "updateTask":
        return createResponse(TaskService.updateTask(data));
      case "assignTask":
        if (!data.taskId || !data.cleanerId) {
          return createResponse(
            { error: "Missing required fields: taskId and cleanerId" },
            400
          );
        }
        return createResponse(
          TaskService.assignTask(data.taskId, data.cleanerId, data.assignedBy)
        );
      case "updateTaskStatus":
        if (!data.taskId || !data.status) {
          return createResponse(
            { error: "Missing required fields: taskId and status" },
            400
          );
        }
        return createResponse(
          TaskService.updateTaskStatus(
            data.taskId,
            data.status,
            data.comments,
            data.updatedBy
          )
        );
      case "requestProducts":
        if (!data.taskId || !data.productRequests) {
          return createResponse(
            { error: "Missing required fields: taskId and productRequests" },
            400
          );
        }
        return createResponse(
          ProductService.requestProducts(data.taskId, data.productRequests)
        );
      case "importReservations":
        return createResponse(TaskService.importReservations());
      case "getMonthlyReport":
        return createResponse(
          ReportService.getMonthlyReport(data.month, data.year, data.cleanerId)
        );
      case "addComment":
        if (!data.taskId || !data.comment) {
          return createResponse(
            { error: "Missing required fields: taskId and comment" },
            400
          );
        }
        return createResponse(
          CommentService.addComment(data.taskId, data.userId, data.comment, data.commentType)
        );
      case "getComments":
        if (!data.taskId) {
          return createResponse(
            { error: "Missing required field: taskId" },
            400
          );
        }
        return createResponse(
          CommentService.getTaskComments(data.taskId, data.commentType)
        );
      case "logRejection":
        if (!data.taskId || !data.rejectionReason) {
          return createResponse(
            { error: "Missing required fields: taskId and rejectionReason" },
            400
          );
        }
        return createResponse(
          RejectionService.logRejection(data.taskId, data.userId, data.rejectionReason, data.previousCleanerId)
        );
      case "createProposal":
        if (!data.taskId || !data.proposedTime) {
          return createResponse(
            { error: "Missing required fields: taskId and proposedTime" },
            400
          );
        }
        return createResponse(
          ProposalService.createProposal(data.taskId, data.userId, data.proposedTime, data.proposalReason)
        );
      case "approveProposal":
        if (!data.proposalId) {
          return createResponse(
            { error: "Missing required field: proposalId" },
            400
          );
        }
        return createResponse(
          ProposalService.approveProposal(data.proposalId, data.adminId)
        );
      case "rejectProposal":
        if (!data.proposalId) {
          return createResponse(
            { error: "Missing required field: proposalId" },
            400
          );
        }
        return createResponse(
          ProposalService.rejectProposal(data.proposalId, data.adminId, data.rejectionReason)
        );
      case "logEntry":
        if (!data.taskId || !data.userId) {
          return createResponse(
            { error: "Missing required fields: taskId and userId" },
            400
          );
        }
        return createResponse(
          TimingService.logEntry(data.taskId, data.userId, data.timestamp)
        );
      case "logExit":
        if (!data.taskId || !data.userId) {
          return createResponse(
            { error: "Missing required fields: taskId and userId" },
            400
          );
        }
        return createResponse(
          TimingService.logExit(data.taskId, data.userId, data.timestamp)
        );
      case "logProductUsage":
        if (!data.taskId || !data.userId || !data.productId) {
          return createResponse(
            { error: "Missing required fields: taskId, userId and productId" },
            400
          );
        }
        return createResponse(
          ProductUsageService.logProductUsage(data.taskId, data.userId, data.productId, data.quantity, data.notes)
        );
      case "logMultipleProductUsage":
        if (!data.taskId || !data.userId || !data.productUsages) {
          return createResponse(
            { error: "Missing required fields: taskId, userId and productUsages" },
            400
          );
        }
        return createResponse(
          ProductUsageService.logMultipleProductUsage(data.taskId, data.userId, data.productUsages)
        );
      default:
        return createResponse(
          {
            error:
              "Invalid action. Supported actions: createTask, updateTask, assignTask, updateTaskStatus, requestProducts, importReservations, getMonthlyReport, addComment, getComments, logRejection, createProposal, approveProposal, rejectProposal, logEntry, logExit, logProductUsage, logMultipleProductUsage",
          },
          400
        );
    }
  } catch (error) {
    console.error("doPost error:", error);
    return createResponse(
      { error: "Internal server error: " + error.message },
      500
    );
  }
}

// Helper function to parse URL encoded form data
function parseUrlEncoded(data) {
  const result = {};
  const pairs = data.split("&");

  for (const pair of pairs) {
    const [key, value] = pair.split("=").map(decodeURIComponent);
    if (key && value !== undefined) {
      if (key.includes(".")) {
        // Handle nested objects (e.g., "user.name" -> {user: {name: value}})
        const keys = key.split(".");
        let current = result;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
      } else {
        // Handle arrays and regular values
        if (value.startsWith("[") && value.endsWith("]")) {
          try {
            result[key] = JSON.parse(value);
          } catch (e) {
            result[key] = value;
          }
        } else {
          result[key] = value;
        }
      }
    }
  }

  return result;
}

// Helper function to parse form data into nested objects
function parseFormData(parameters) {
  const data = {};

  for (const key in parameters) {
    if (key === "action") continue; // Skip action parameter

    const value = parameters[key];

    if (key.includes(".")) {
      // Handle nested objects (e.g., "user.name" -> {user: {name: value}})
      const keys = key.split(".");
      let current = data;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
    } else {
      // Handle arrays and regular values
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      } else {
        data[key] = value;
      }
    }
  }

  return data;
}

// Helper function to create JSON response with CORS headers
function createResponse(data, status = 200) {
  const response = {
    success: status < 400,
    data: data,
    timestamp: new Date().toISOString(),
  };

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
    ContentService.MimeType.JSON
  );
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
      "task_events",
      "task_comments",
      "task_rejections",
      "task_proposals",
      "task_timings",
      "task_product_usage",
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
