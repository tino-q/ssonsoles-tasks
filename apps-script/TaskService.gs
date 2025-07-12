// Task Service - Handles all task-related operations

const TaskService = {
  // Get tasks with optional filters
  getTasks: function (filters = {}) {
    const sheet = getSheet("tasks");
    if (!sheet) throw new Error("Tasks sheet not found");

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    let tasks = rows
      .map((row) => {
        const task = {};
        headers.forEach((header, index) => {
          task[header] = row[index];
        });
        return task;
      })
      .filter((task) => task.id); // Filter out empty rows

    // Apply filters
    if (filters.cleanerId) {
      tasks = tasks.filter(
        (task) => task.assigned_cleaner_id == filters.cleanerId
      );
    }

    if (filters.status) {
      tasks = tasks.filter((task) => task.status === filters.status);
    }

    if (filters.property) {
      tasks = tasks.filter((task) => task.property === filters.property);
    }

    if (filters.date) {
      tasks = tasks.filter((task) => {
        const taskDate = new Date(task.date).toDateString();
        const filterDate = new Date(filters.date).toDateString();
        return taskDate === filterDate;
      });
    }

    return tasks;
  },

  // Create a new task
  createTask: function (taskData) {
    const sheet = getSheet("tasks");
    if (!sheet) throw new Error("Tasks sheet not found");

    const id = generateId();
    const timestamp = new Date().toISOString();

    const newTask = {
      id: id,
      property: taskData.property,
      type: taskData.type || "cleaning",
      date: taskData.date,
      status: "URGENT", // New tasks start as URGENT (unassigned)
      assigned_cleaner_id: "",
      notes: taskData.notes || "",
      comments: "",
      start_time: "",
      end_time: "",
      start_video: "",
      end_video: "",
      products_used: "[]", // Initialize as empty JSON array
      created_at: timestamp,
      updated_at: timestamp,
      created_by: taskData.created_by || "admin", // Should be passed from caller
      last_updated_by: taskData.created_by || "admin",
    };

    // Get headers to ensure correct column order
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const values = headers.map((header) => newTask[header] || "");

    sheet.appendRow(values);

    return newTask;
  },

  // Update an existing task
  updateTask: function (updateData) {
    const sheet = getSheet("tasks");
    if (!sheet) throw new Error("Tasks sheet not found");

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf("id");

    if (idIndex === -1) throw new Error("ID column not found");

    // Find the task row
    let targetRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] === updateData.id) {
        targetRow = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }

    if (targetRow === -1) throw new Error("Task not found");

    // Automatically add audit fields
    const finalUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Update specific columns
    Object.keys(finalUpdateData).forEach((key) => {
      if (key !== "id") {
        // Don't update the ID
        const columnIndex = headers.indexOf(key);
        if (columnIndex !== -1) {
          sheet
            .getRange(targetRow, columnIndex + 1)
            .setValue(finalUpdateData[key]);
        }
      }
    });

    return { success: true, updated: finalUpdateData };
  },

  // Assign a cleaner to a task
  assignTask: function (taskId, cleanerId, assignedBy = "admin") {
    const updateData = {
      id: taskId,
      assigned_cleaner_id: cleanerId,
      status: "PENDING", // Task moves to PENDING when assigned
      last_updated_by: assignedBy,
    };

    return this.updateTask(updateData);
  },

  // Update task status (used by cleaners to confirm/reject)
  updateTaskStatus: function (
    taskId,
    status,
    comments = "",
    updatedBy = "cleaner"
  ) {
    const updateData = {
      id: taskId,
      status: status,
      last_updated_by: updatedBy,
    };

    // Add comments if provided
    if (comments) {
      updateData.comments = comments;
    }

    return this.updateTask(updateData);
  },

  // Import reservations and create cleaning tasks
  importReservations: function () {
    const reservationsSheet = getSheet("reservations");
    const tasksSheet = getSheet("tasks");

    if (!reservationsSheet) throw new Error("Reservations sheet not found");
    if (!tasksSheet) throw new Error("Tasks sheet not found");

    const reservations = reservationsSheet.getDataRange().getValues();
    const headers = reservations[0];
    const rows = reservations.slice(1);

    const newTasks = [];
    const existingTasks = this.getTasks();

    rows.forEach((row) => {
      const reservation = {};
      headers.forEach((header, index) => {
        reservation[header] = row[index];
      });

      if (reservation.checkout_date) {
        const checkoutDate = new Date(reservation.checkout_date);

        // Check if we already have a task for this checkout
        const existingTask = existingTasks.find(
          (task) =>
            task.property === reservation.property &&
            new Date(task.date).toDateString() === checkoutDate.toDateString()
        );

        if (!existingTask) {
          const taskData = {
            property: reservation.property,
            type: "cleaning",
            date: checkoutDate.toISOString().split("T")[0],
            notes: `Checkout cleaning. ${reservation.notes || ""}`,
          };

          const newTask = this.createTask(taskData);
          newTasks.push(newTask);
        }
      }
    });

    return {
      imported: newTasks.length,
      tasks: newTasks,
    };
  },
};

// Make TaskService available globally
this.TaskService = TaskService;
