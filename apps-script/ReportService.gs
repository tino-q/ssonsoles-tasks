// Report Service - Handles report generation and analytics

const ReportService = {
  // Generate monthly report for a cleaner
  getMonthlyReport: function (month, year, cleanerId = null) {
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed
    const endDate = new Date(year, month, 0); // Last day of the month

    let cleaners = [];
    if (cleanerId) {
      const cleaner = CleanerService.getCleanerById(cleanerId);
      if (cleaner) {
        cleaners = [cleaner];
      }
    } else {
      cleaners = CleanerService.getCleaners();
    }

    const reports = cleaners.map((cleaner) => {
      const tasks = TaskService.getTasks({
        cleanerId: cleaner.id,
      }).filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate >= startDate && taskDate <= endDate;
      });

      const stats = this.calculateCleanerStats(cleaner, tasks);

      return {
        cleaner: cleaner,
        period: {
          month: month,
          year: year,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        },
        stats: stats,
        tasks: tasks.map((task) => ({
          id: task.id,
          property: task.property,
          date: task.date,
          status: task.status,
          start_time: task.start_time,
          end_time: task.end_time,
          hours: this.calculateTaskHours(task),
          comments: task.comments,
        })),
      };
    });

    return cleanerId ? reports[0] : reports;
  },

  // Calculate cleaner statistics for given tasks
  calculateCleanerStats: function (cleaner, tasks) {
    const stats = {
      total_tasks: tasks.length,
      completed_tasks: 0,
      confirmed_tasks: 0,
      assigned_tasks: 0,
      rejected_tasks: 0,
      tentative_tasks: 0,
      total_hours: 0,
      hourly_rate: cleaner.hourly_rate || 15,
      base_payment: 0,
      travel_allowance: 0, // This could be calculated based on properties
      total_payment: 0,
    };

    tasks.forEach((task) => {
      // Count by status
      switch (task.status) {
        case "COMPLETED":
          stats.completed_tasks++;
          break;
        case "CONFIRMED":
          stats.confirmed_tasks++;
          break;
        case "ASSIGNED":
          stats.assigned_tasks++;
          break;
        case "REJECTED":
          stats.rejected_tasks++;
          break;
        case "TENTATIVE":
          stats.tentative_tasks++;
          break;
      }

      // Calculate hours
      const hours = this.calculateTaskHours(task);
      if (hours > 0) {
        stats.total_hours += hours;
      }
    });

    // Round hours to 2 decimal places
    stats.total_hours = Math.round(stats.total_hours * 100) / 100;

    // Calculate payments
    stats.base_payment = stats.total_hours * stats.hourly_rate;
    stats.travel_allowance = stats.completed_tasks * 5; // €5 per completed task
    stats.total_payment = stats.base_payment + stats.travel_allowance;

    // Round payments to 2 decimal places
    stats.base_payment = Math.round(stats.base_payment * 100) / 100;
    stats.travel_allowance = Math.round(stats.travel_allowance * 100) / 100;
    stats.total_payment = Math.round(stats.total_payment * 100) / 100;

    return stats;
  },

  // Calculate hours worked for a single task
  calculateTaskHours: function (task) {
    if (!task.start_time || !task.end_time) {
      return 0;
    }

    try {
      const start = new Date(task.start_time);
      const end = new Date(task.end_time);
      const hours = (end - start) / (1000 * 60 * 60); // Convert to hours

      // Sanity check: hours should be positive and less than 24
      if (hours > 0 && hours < 24) {
        return Math.round(hours * 100) / 100; // Round to 2 decimal places
      }
    } catch (error) {
      console.error("Error calculating task hours:", error);
    }

    return 0;
  },

  // Generate property usage report
  getPropertyReport: function (startDate = null, endDate = null) {
    let tasks = TaskService.getTasks();

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      tasks = tasks.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate >= start && taskDate <= end;
      });
    }

    const propertyStats = {};

    tasks.forEach((task) => {
      if (!propertyStats[task.property]) {
        propertyStats[task.property] = {
          property: task.property,
          total_tasks: 0,
          completed_tasks: 0,
          total_hours: 0,
          average_hours: 0,
          cleaners_used: new Set(),
        };
      }

      const stats = propertyStats[task.property];
      stats.total_tasks++;

      if (task.status === "COMPLETED") {
        stats.completed_tasks++;
        const hours = this.calculateTaskHours(task);
        stats.total_hours += hours;
      }

      if (task.assigned_cleaner_id) {
        stats.cleaners_used.add(task.assigned_cleaner_id);
      }
    });

    // Convert Set to array and calculate averages
    Object.values(propertyStats).forEach((stats) => {
      stats.cleaners_used = Array.from(stats.cleaners_used);
      stats.average_hours =
        stats.completed_tasks > 0
          ? Math.round((stats.total_hours / stats.completed_tasks) * 100) / 100
          : 0;
      stats.total_hours = Math.round(stats.total_hours * 100) / 100;
    });

    return Object.values(propertyStats).sort(
      (a, b) => b.total_tasks - a.total_tasks
    );
  },

  // Generate overall system report
  getSystemReport: function (startDate = null, endDate = null) {
    const cleaners = CleanerService.getCleaners();
    const tasks = TaskService.getTasks();
    const productRequests = ProductService.getAllProductRequests();

    let filteredTasks = tasks;
    let filteredRequests = productRequests;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filteredTasks = tasks.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate >= start && taskDate <= end;
      });

      filteredRequests = productRequests.filter((request) => {
        const requestDate = new Date(request.request_date);
        return requestDate >= start && requestDate <= end;
      });
    }

    const report = {
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      totals: {
        active_cleaners: cleaners.length,
        total_tasks: filteredTasks.length,
        completed_tasks: filteredTasks.filter((t) => t.status === "COMPLETED")
          .length,
        assigned_tasks: filteredTasks.filter((t) => t.status === "ASSIGNED")
          .length,
        urgent_tasks: filteredTasks.filter((t) => t.status === "URGENT").length,
        total_hours: 0,
        total_payment: 0,
        product_requests: filteredRequests.length,
      },
      properties: this.getPropertyReport(startDate, endDate),
      product_summary: ProductService.getProductRequestSummary(
        startDate,
        endDate
      ),
    };

    // Calculate total hours and payment
    filteredTasks.forEach((task) => {
      const hours = this.calculateTaskHours(task);
      report.totals.total_hours += hours;

      if (task.assigned_cleaner_id) {
        const cleaner = cleaners.find((c) => c.id == task.assigned_cleaner_id);
        if (cleaner && hours > 0) {
          report.totals.total_payment += hours * (cleaner.hourly_rate || 15);
        }
      }
    });

    // Add travel allowances
    report.totals.total_payment += report.totals.completed_tasks * 5;

    // Round totals
    report.totals.total_hours =
      Math.round(report.totals.total_hours * 100) / 100;
    report.totals.total_payment =
      Math.round(report.totals.total_payment * 100) / 100;

    return report;
  },
};

// Make ReportService available globally
this.ReportService = ReportService;
