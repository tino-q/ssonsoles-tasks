// API service for communicating with Google Apps Script backend

const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbwxrS7yDMOZw4RguTTLjdrVquzgiceYyv_th49qGV_6ht-rCewkZvcmpAR0ybRMoW6C/exec";

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}?action=${endpoint}`;

    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    if (options.data) {
      config.method = "POST";
      config.body = JSON.stringify(options.data);
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
