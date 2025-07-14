// TimingService - Manejo de eventos de tiempo (ENTRY/EXIT) para tareas
// Almacena eventos de tiempo en lugar de mutaciones en tabla principal

const TimingService = {
  // Registrar entrada a una tarea
  logEntry: function(taskId, userId, timestamp = null) {
    try {
      const sheet = getSheet("task_timings");
      if (!sheet) {
        throw new Error("task_timings sheet not found");
      }

      // Validar que la tarea existe
      const task = TaskService.getTaskById(taskId);
      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      // Verificar que no hay una entrada sin salida
      const openEntry = this.getOpenEntry(taskId, userId);
      if (openEntry) {
        throw new Error("There is already an open entry for this task and user");
      }

      const newEntry = {
        id: generateId(),
        task_id: taskId,
        user_id: userId,
        event_type: "ENTRY",
        timestamp: timestamp || new Date().toISOString(),
        recorded_at: new Date().toISOString()
      };

      // Obtener headers para orden correcto
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const values = headers.map(header => newEntry[header] || "");

      // Insertar evento
      sheet.appendRow(values);

      console.log(`Entry logged for task ${taskId} by user ${userId}`);
      return newEntry;

    } catch (error) {
      console.error("Error logging entry:", error);
      throw error;
    }
  },

  // Registrar salida de una tarea
  logExit: function(taskId, userId, timestamp = null) {
    try {
      const sheet = getSheet("task_timings");
      if (!sheet) {
        throw new Error("task_timings sheet not found");
      }

      // Validar que la tarea existe
      const task = TaskService.getTaskById(taskId);
      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      // Verificar que hay una entrada abierta
      const openEntry = this.getOpenEntry(taskId, userId);
      if (!openEntry) {
        throw new Error("No open entry found for this task and user");
      }

      const newExit = {
        id: generateId(),
        task_id: taskId,
        user_id: userId,
        event_type: "EXIT",
        timestamp: timestamp || new Date().toISOString(),
        recorded_at: new Date().toISOString()
      };

      // Obtener headers para orden correcto
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const values = headers.map(header => newExit[header] || "");

      // Insertar evento
      sheet.appendRow(values);

      console.log(`Exit logged for task ${taskId} by user ${userId}`);
      return newExit;

    } catch (error) {
      console.error("Error logging exit:", error);
      throw error;
    }
  },

  // Obtener entrada abierta (sin salida correspondiente)
  getOpenEntry: function(taskId, userId) {
    try {
      const timings = this.getTaskTimings(taskId);
      
      // Filtrar solo eventos de este usuario
      const userTimings = timings.filter(timing => timing.user_id === userId);
      
      // Ordenar por timestamp
      userTimings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Buscar entrada sin salida correspondiente
      let openEntry = null;
      for (const timing of userTimings) {
        if (timing.event_type === "ENTRY") {
          openEntry = timing;
        } else if (timing.event_type === "EXIT" && openEntry) {
          openEntry = null; // Se cerró la entrada
        }
      }
      
      return openEntry;

    } catch (error) {
      console.error("Error getting open entry:", error);
      throw error;
    }
  },

  // Obtener todos los eventos de tiempo de una tarea
  getTaskTimings: function(taskId) {
    try {
      const sheet = getSheet("task_timings");
      if (!sheet) {
        throw new Error("task_timings sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const timings = rows
        .map(row => {
          const timing = {};
          headers.forEach((header, index) => {
            timing[header] = row[index];
          });
          return timing;
        })
        .filter(timing => timing.task_id === taskId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return timings;

    } catch (error) {
      console.error("Error getting task timings:", error);
      throw error;
    }
  },

  // Obtener eventos de tiempo por usuario
  getTimingsByUser: function(userId, daysBack = 30) {
    try {
      const sheet = getSheet("task_timings");
      if (!sheet) {
        throw new Error("task_timings sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const timings = rows
        .map(row => {
          const timing = {};
          headers.forEach((header, index) => {
            timing[header] = row[index];
          });
          return timing;
        })
        .filter(timing => {
          const timingTime = new Date(timing.timestamp);
          return timing.user_id === userId && timingTime > cutoffTime;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return timings;

    } catch (error) {
      console.error("Error getting timings by user:", error);
      throw error;
    }
  },

  // Calcular tiempo total trabajado en una tarea
  calculateTaskDuration: function(taskId, userId = null) {
    try {
      let timings = this.getTaskTimings(taskId);
      
      // Filtrar por usuario si se especifica
      if (userId) {
        timings = timings.filter(timing => timing.user_id === userId);
      }

      // Agrupar por usuario para calcular duraciones
      const userDurations = {};
      
      timings.forEach(timing => {
        const user = timing.user_id;
        if (!userDurations[user]) {
          userDurations[user] = {
            user_id: user,
            total_minutes: 0,
            sessions: []
          };
        }
      });

      // Calcular duraciones por sesión
      Object.keys(userDurations).forEach(user => {
        const userTimings = timings.filter(t => t.user_id === user);
        userTimings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        let currentEntry = null;
        for (const timing of userTimings) {
          if (timing.event_type === "ENTRY") {
            currentEntry = timing;
          } else if (timing.event_type === "EXIT" && currentEntry) {
            const entryTime = new Date(currentEntry.timestamp);
            const exitTime = new Date(timing.timestamp);
            const durationMinutes = (exitTime - entryTime) / (1000 * 60);
            
            userDurations[user].sessions.push({
              entry: currentEntry,
              exit: timing,
              duration_minutes: durationMinutes
            });
            
            userDurations[user].total_minutes += durationMinutes;
            currentEntry = null;
          }
        }
      });

      return userId ? userDurations[userId] : userDurations;

    } catch (error) {
      console.error("Error calculating task duration:", error);
      throw error;
    }
  },

  // Obtener estadísticas de tiempo
  getTimingStatistics: function(daysBack = 30) {
    try {
      const sheet = getSheet("task_timings");
      if (!sheet) {
        throw new Error("task_timings sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const recentTimings = rows
        .map(row => {
          const timing = {};
          headers.forEach((header, index) => {
            timing[header] = row[index];
          });
          return timing;
        })
        .filter(timing => {
          const timingTime = new Date(timing.timestamp);
          return timingTime > cutoffTime;
        });

      const stats = {
        total_entries: recentTimings.filter(t => t.event_type === "ENTRY").length,
        total_exits: recentTimings.filter(t => t.event_type === "EXIT").length,
        open_sessions: 0,
        users_with_timings: new Set(),
        tasks_with_timings: new Set()
      };

      // Calcular sesiones abiertas
      const userSessions = {};
      recentTimings.forEach(timing => {
        const key = `${timing.user_id}_${timing.task_id}`;
        if (!userSessions[key]) {
          userSessions[key] = { entries: 0, exits: 0 };
        }
        
        if (timing.event_type === "ENTRY") {
          userSessions[key].entries++;
        } else {
          userSessions[key].exits++;
        }
        
        stats.users_with_timings.add(timing.user_id);
        stats.tasks_with_timings.add(timing.task_id);
      });

      // Contar sesiones abiertas
      Object.values(userSessions).forEach(session => {
        if (session.entries > session.exits) {
          stats.open_sessions++;
        }
      });

      stats.users_with_timings = stats.users_with_timings.size;
      stats.tasks_with_timings = stats.tasks_with_timings.size;

      return stats;

    } catch (error) {
      console.error("Error getting timing statistics:", error);
      throw error;
    }
  },

  // Verificar si una tarea está activa (tiene sesiones abiertas)
  isTaskActive: function(taskId) {
    try {
      const timings = this.getTaskTimings(taskId);
      
      // Agrupar por usuario
      const userSessions = {};
      timings.forEach(timing => {
        if (!userSessions[timing.user_id]) {
          userSessions[timing.user_id] = { entries: 0, exits: 0 };
        }
        
        if (timing.event_type === "ENTRY") {
          userSessions[timing.user_id].entries++;
        } else {
          userSessions[timing.user_id].exits++;
        }
      });

      // Verificar si hay sesiones abiertas
      for (const session of Object.values(userSessions)) {
        if (session.entries > session.exits) {
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error("Error checking if task is active:", error);
      throw error;
    }
  }
};

// Hacer TimingService disponible globalmente
this.TimingService = TimingService;