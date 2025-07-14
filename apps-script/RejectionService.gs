// RejectionService - Manejo específico de rechazos de tareas
// Registra rechazos con motivos y permite análisis detallado

const RejectionService = {
  // Registrar un rechazo de tarea
  logRejection: function(taskId, userId, rejectionReason, previousCleanerId = null) {
    try {
      const sheet = getSheet("task_rejections");
      if (!sheet) {
        throw new Error("task_rejections sheet not found");
      }

      // Validar que la tarea existe
      const task = TaskService.getTaskById(taskId);
      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      const newRejection = {
        id: generateId(),
        task_id: taskId,
        user_id: userId,
        rejection_reason: rejectionReason,
        timestamp: new Date().toISOString(),
        previous_cleaner_id: previousCleanerId || task.assigned_cleaner_id || ""
      };

      // Obtener headers para orden correcto
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const values = headers.map(header => newRejection[header] || "");

      // Insertar rechazo
      sheet.appendRow(values);

      // Actualizar estado de la tarea a REJECTED
      TaskService.updateTaskStatus(taskId, "REJECTED", "", userId);

      console.log(`Rejection logged for task ${taskId} by user ${userId}`);
      return newRejection;

    } catch (error) {
      console.error("Error logging rejection:", error);
      throw error;
    }
  },

  // Obtener todos los rechazos de una tarea
  getTaskRejections: function(taskId) {
    try {
      const sheet = getSheet("task_rejections");
      if (!sheet) {
        throw new Error("task_rejections sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const rejections = rows
        .map(row => {
          const rejection = {};
          headers.forEach((header, index) => {
            rejection[header] = row[index];
          });
          return rejection;
        })
        .filter(rejection => rejection.task_id === taskId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return rejections;

    } catch (error) {
      console.error("Error getting task rejections:", error);
      throw error;
    }
  },

  // Obtener rechazos por usuario (para análisis de rendimiento)
  getRejectionsByUser: function(userId, daysBack = 30) {
    try {
      const sheet = getSheet("task_rejections");
      if (!sheet) {
        throw new Error("task_rejections sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const rejections = rows
        .map(row => {
          const rejection = {};
          headers.forEach((header, index) => {
            rejection[header] = row[index];
          });
          return rejection;
        })
        .filter(rejection => {
          const rejectionTime = new Date(rejection.timestamp);
          return rejection.user_id === userId && rejectionTime > cutoffTime;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return rejections;

    } catch (error) {
      console.error("Error getting rejections by user:", error);
      throw error;
    }
  },

  // Obtener estadísticas de rechazos
  getRejectionStatistics: function(daysBack = 30) {
    try {
      const sheet = getSheet("task_rejections");
      if (!sheet) {
        throw new Error("task_rejections sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const recentRejections = rows
        .map(row => {
          const rejection = {};
          headers.forEach((header, index) => {
            rejection[header] = row[index];
          });
          return rejection;
        })
        .filter(rejection => {
          const rejectionTime = new Date(rejection.timestamp);
          return rejectionTime > cutoffTime;
        });

      const stats = {
        total_rejections: recentRejections.length,
        rejections_by_user: {},
        rejections_by_reason: {},
        rejections_by_task: {},
        most_rejected_tasks: [],
        top_rejection_reasons: []
      };

      // Procesar estadísticas
      recentRejections.forEach(rejection => {
        // Por usuario
        if (!stats.rejections_by_user[rejection.user_id]) {
          stats.rejections_by_user[rejection.user_id] = 0;
        }
        stats.rejections_by_user[rejection.user_id]++;

        // Por razón
        if (!stats.rejections_by_reason[rejection.rejection_reason]) {
          stats.rejections_by_reason[rejection.rejection_reason] = 0;
        }
        stats.rejections_by_reason[rejection.rejection_reason]++;

        // Por tarea
        if (!stats.rejections_by_task[rejection.task_id]) {
          stats.rejections_by_task[rejection.task_id] = 0;
        }
        stats.rejections_by_task[rejection.task_id]++;
      });

      // Ordenar para obtener tops
      stats.most_rejected_tasks = Object.entries(stats.rejections_by_task)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([task_id, count]) => ({task_id, count}));

      stats.top_rejection_reasons = Object.entries(stats.rejections_by_reason)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([reason, count]) => ({reason, count}));

      return stats;

    } catch (error) {
      console.error("Error getting rejection statistics:", error);
      throw error;
    }
  },

  // Obtener rechazos recientes
  getRecentRejections: function(hoursBack = 24) {
    try {
      const sheet = getSheet("task_rejections");
      if (!sheet) {
        throw new Error("task_rejections sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      const recentRejections = rows
        .map(row => {
          const rejection = {};
          headers.forEach((header, index) => {
            rejection[header] = row[index];
          });
          return rejection;
        })
        .filter(rejection => {
          const rejectionTime = new Date(rejection.timestamp);
          return rejectionTime > cutoffTime;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return recentRejections;

    } catch (error) {
      console.error("Error getting recent rejections:", error);
      throw error;
    }
  },

  // Buscar rechazos por motivo
  searchRejectionsByReason: function(reasonText) {
    try {
      const sheet = getSheet("task_rejections");
      if (!sheet) {
        throw new Error("task_rejections sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const matchingRejections = rows
        .map(row => {
          const rejection = {};
          headers.forEach((header, index) => {
            rejection[header] = row[index];
          });
          return rejection;
        })
        .filter(rejection => {
          return rejection.rejection_reason.toLowerCase().includes(reasonText.toLowerCase());
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return matchingRejections;

    } catch (error) {
      console.error("Error searching rejections by reason:", error);
      throw error;
    }
  },

  // Obtener tasa de rechazo por usuario
  getUserRejectionRate: function(userId, daysBack = 30) {
    try {
      // Obtener rechazos del usuario
      const rejections = this.getRejectionsByUser(userId, daysBack);
      
      // Obtener todas las tareas asignadas al usuario en el período
      const tasks = TaskService.getTasks({cleanerId: userId});
      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);
      
      const recentTasks = tasks.filter(task => {
        const taskTime = new Date(task.created_at);
        return taskTime > cutoffTime;
      });

      const totalTasks = recentTasks.length;
      const totalRejections = rejections.length;
      const rejectionRate = totalTasks > 0 ? (totalRejections / totalTasks) * 100 : 0;

      return {
        user_id: userId,
        total_tasks: totalTasks,
        total_rejections: totalRejections,
        rejection_rate: rejectionRate,
        period_days: daysBack
      };

    } catch (error) {
      console.error("Error getting user rejection rate:", error);
      throw error;
    }
  }
};

// Hacer RejectionService disponible globalmente
this.RejectionService = RejectionService;