// API service for communicating with Google Apps Script backend

const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbyPwTgroreR6MGxhhLJVhcoC7xeDmF8R6kjhyaPzA-vUA3HMizidVcq9vy1Wf9MwtiL/exec";

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
    return this.request("getTasks", { data: filters });
  }

  async createTask(taskData) {
    return this.request("createTask", { data: taskData });
  }

  async updateTask(taskId, updateData) {
    return this.request("updateTask", { data: { id: taskId, ...updateData } });
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
