// EventService - Manejo de snapshots y eventos del sistema
// Captura snapshots completos del estado de las tareas para historial

const EventService = {
  // Capturar snapshot completo de una tarea
  captureSnapshot: function(taskId, changedBy) {
    try {
      const eventsSheet = getSheet("task_events");
      if (!eventsSheet) {
        throw new Error("task_events sheet not found");
      }

      // Obtener el estado actual de la tarea
      const currentTask = TaskService.getTaskById(taskId);
      if (!currentTask) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      // Crear snapshot con campos adicionales - NUEVO ESQUEMA SIN MEDIA/NOTAS/TIEMPO
      const snapshot = {
        snapshot_id: generateId(),
        task_id: taskId,
        property: currentTask.property,
        type: currentTask.type,
        date: currentTask.date,
        status: currentTask.status,
        assigned_cleaner_id: currentTask.assigned_cleaner_id || "",
        created_at: currentTask.created_at,
        updated_at: currentTask.updated_at,
        created_by: currentTask.created_by,
        last_updated_by: currentTask.last_updated_by,
        snapshot_timestamp: new Date().toISOString(),
        changed_by: changedBy || "system"
      };

      // Obtener headers para asegurar orden correcto
      const headers = eventsSheet.getRange(1, 1, 1, eventsSheet.getLastColumn()).getValues()[0];
      const values = headers.map(header => snapshot[header] || "");

      // Insertar snapshot
      eventsSheet.appendRow(values);

      console.log(`Snapshot captured for task ${taskId} by ${changedBy}`);
      return snapshot;

    } catch (error) {
      console.error("Error capturing snapshot:", error);
      throw error;
    }
  },

  // Obtener historial completo de una tarea
  getTaskHistory: function(taskId) {
    try {
      const eventsSheet = getSheet("task_events");
      if (!eventsSheet) {
        throw new Error("task_events sheet not found");
      }

      const data = eventsSheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const history = rows
        .map(row => {
          const snapshot = {};
          headers.forEach((header, index) => {
            snapshot[header] = row[index];
          });
          return snapshot;
        })
        .filter(snapshot => snapshot.task_id === taskId)
        .sort((a, b) => new Date(a.snapshot_timestamp) - new Date(b.snapshot_timestamp));

      return history;

    } catch (error) {
      console.error("Error getting task history:", error);
      throw error;
    }
  },

  // Obtener cambios recientes en el sistema
  getRecentChanges: function(hoursBack = 24) {
    try {
      const eventsSheet = getSheet("task_events");
      if (!eventsSheet) {
        throw new Error("task_events sheet not found");
      }

      const data = eventsSheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      const recentChanges = rows
        .map(row => {
          const snapshot = {};
          headers.forEach((header, index) => {
            snapshot[header] = row[index];
          });
          return snapshot;
        })
        .filter(snapshot => {
          const snapshotTime = new Date(snapshot.snapshot_timestamp);
          return snapshotTime > cutoffTime;
        })
        .sort((a, b) => new Date(b.snapshot_timestamp) - new Date(a.snapshot_timestamp));

      return recentChanges;

    } catch (error) {
      console.error("Error getting recent changes:", error);
      throw error;
    }
  },

  // Obtener estadísticas de cambios por usuario
  getChangeStatistics: function(daysBack = 7) {
    try {
      const eventsSheet = getSheet("task_events");
      if (!eventsSheet) {
        throw new Error("task_events sheet not found");
      }

      const data = eventsSheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const stats = {};

      rows.forEach(row => {
        const snapshot = {};
        headers.forEach((header, index) => {
          snapshot[header] = row[index];
        });

        const snapshotTime = new Date(snapshot.snapshot_timestamp);
        if (snapshotTime > cutoffTime) {
          const user = snapshot.changed_by || "unknown";
          if (!stats[user]) {
            stats[user] = {
              user: user,
              changes: 0,
              tasks_affected: new Set()
            };
          }
          stats[user].changes++;
          stats[user].tasks_affected.add(snapshot.task_id);
        }
      });

      // Convertir Sets a números
      Object.keys(stats).forEach(user => {
        stats[user].tasks_affected = stats[user].tasks_affected.size;
      });

      return Object.values(stats);

    } catch (error) {
      console.error("Error getting change statistics:", error);
      throw error;
    }
  },

  // Comparar dos snapshots y obtener diferencias
  compareSnapshots: function(snapshotA, snapshotB) {
    const differences = {};
    const fieldsToCompare = ['property', 'type', 'date', 'status', 'assigned_cleaner_id', 'created_by', 'last_updated_by'];

    fieldsToCompare.forEach(field => {
      if (snapshotA[field] !== snapshotB[field]) {
        differences[field] = {
          from: snapshotA[field],
          to: snapshotB[field]
        };
      }
    });

    return {
      hasChanges: Object.keys(differences).length > 0,
      differences: differences,
      timespan: new Date(snapshotB.snapshot_timestamp) - new Date(snapshotA.snapshot_timestamp)
    };
  },

  // Obtener última versión de cada tarea (estado actual según snapshots)
  getLatestSnapshots: function() {
    try {
      const eventsSheet = getSheet("task_events");
      if (!eventsSheet) {
        throw new Error("task_events sheet not found");
      }

      const data = eventsSheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const taskSnapshots = {};

      rows.forEach(row => {
        const snapshot = {};
        headers.forEach((header, index) => {
          snapshot[header] = row[index];
        });

        const taskId = snapshot.task_id;
        const snapshotTime = new Date(snapshot.snapshot_timestamp);

        if (!taskSnapshots[taskId] || 
            snapshotTime > new Date(taskSnapshots[taskId].snapshot_timestamp)) {
          taskSnapshots[taskId] = snapshot;
        }
      });

      return Object.values(taskSnapshots);

    } catch (error) {
      console.error("Error getting latest snapshots:", error);
      throw error;
    }
  }
};

// Hacer EventService disponible globalmente
this.EventService = EventService;