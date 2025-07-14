// API service for communicating with Google Apps Script backend

const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbwuyuASLsJ_97uoy0II43SMI0Kci4m3BugRNBpj8ApxdOetZ3qso1S3P1wW2w8eR8lc/exec";

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}?action=${endpoint}`;

    const config = {
      method: "GET",
      // Remove Content-Type header to avoid preflight requests
      ...options,
    };

    if (options.data) {
      config.method = "POST";
      // Use URLSearchParams for form data instead of JSON
      const formData = new URLSearchParams();
      this.flattenObject(options.data, formData);
      config.body = formData;
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Helper method to flatten nested objects for form data
  flattenObject(obj, formData, prefix = "") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const formKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === "object" && !Array.isArray(value)) {
          this.flattenObject(value, formData, formKey);
        } else if (Array.isArray(value)) {
          formData.append(formKey, JSON.stringify(value));
        } else {
          formData.append(formKey, value);
        }
      }
    }
  }

  // Tasks
  async getTasks(filters = {}) {
    // Build query string for GET request
    const queryParams = new URLSearchParams();
    queryParams.append("action", "getTasks");

    // Add filters as query parameters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `${API_BASE_URL}?${queryParams.toString()}`;

    try {
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async createTask(taskData) {
    return this.request("createTask", { data: taskData });
  }

  async updateTask(taskId, updateData) {
    return this.request("updateTask", { data: { id: taskId, ...updateData } });
  }

  // Timing Services
  async logEntry(taskId, userId, timestamp = null) {
    return this.request("logEntry", {
      data: { taskId, userId, timestamp },
      method: "POST"
    });
  }

  async logExit(taskId, userId, timestamp = null) {
    return this.request("logExit", {
      data: { taskId, userId, timestamp },
      method: "POST"
    });
  }

  async getTaskTimings(taskId) {
    return this.request("getTaskTimings", {
      taskId: taskId
    });
  }

  // Product Usage Services
  async logProductUsage(taskId, userId, productId, quantity = 1, notes = "") {
    return this.request("logProductUsage", {
      data: { taskId, userId, productId, quantity, notes },
      method: "POST"
    });
  }

  async logMultipleProductUsage(taskId, userId, productUsages) {
    return this.request("logMultipleProductUsage", {
      data: { taskId, userId, productUsages },
      method: "POST"
    });
  }

  async getTaskProductUsage(taskId) {
    return this.request("getTaskProductUsage", {
      taskId: taskId
    });
  }

  // Comment Services
  async addComment(taskId, userId, comment, commentType = "GENERAL") {
    return this.request("addComment", {
      data: { taskId, userId, comment, commentType },
      method: "POST"
    });
  }

  async getComments(taskId) {
    return this.request("getComments", {
      data: { taskId }
    });
  }

  async assignTask(taskId, cleanerId) {
    return this.request("assignTask", { data: { taskId, cleanerId } });
  }

  // Cleaners
  async getCleaners() {
    return this.request("getCleaners");
  }

  async updateTaskStatus(taskId, status, comments = "") {
    return this.request("updateTaskStatus", {
      data: { taskId, status, comments },
    });
  }

  // Rejections
  async logRejection(taskId, userId, rejectionReason) {
    return this.request("logRejection", {
      data: { taskId, userId, rejectionReason },
    });
  }

  // Proposals
  async createProposal(taskId, userId, proposedTime, proposalReason) {
    return this.request("createProposal", {
      data: { taskId, userId, proposedTime, proposalReason },
    });
  }

  // Products
  async getProducts() {
    return this.request("getProducts");
  }

  async requestProducts(taskId, productRequests) {
    return this.request("requestProducts", {
      data: { taskId, productRequests },
    });
  }

  // Reports
  async getMonthlyReport(month, year, cleanerId = null) {
    return this.request("getMonthlyReport", {
      data: { month, year, cleanerId },
    });
  }

  // Reservations
  async importReservations() {
    return this.request("importReservations");
  }
}

export default new ApiService();
