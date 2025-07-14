// CommentService - Manejo de comentarios independientes del estado de tareas
// Permite agregar comentarios a cualquier tarea sin importar su estado

const CommentService = {
  // Agregar un comentario a una tarea
  addComment: function(taskId, userId, comment, commentType = "GENERAL") {
    try {
      const sheet = getSheet("task_comments");
      if (!sheet) {
        throw new Error("task_comments sheet not found");
      }

      // Validar que la tarea existe
      const task = TaskService.getTaskById(taskId);
      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      const newComment = {
        id: generateId(),
        task_id: taskId,
        user_id: userId,
        comment: comment,
        timestamp: new Date().toISOString(),
        comment_type: commentType
      };

      // Obtener headers para orden correcto
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const values = headers.map(header => newComment[header] || "");

      // Insertar comentario
      sheet.appendRow(values);

      console.log(`Comment added to task ${taskId} by user ${userId}`);
      return newComment;

    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // Obtener todos los comentarios de una tarea
  getTaskComments: function(taskId, commentType = null) {
    try {
      const sheet = getSheet("task_comments");
      if (!sheet) {
        throw new Error("task_comments sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      let comments = rows
        .map(row => {
          const comment = {};
          headers.forEach((header, index) => {
            comment[header] = row[index];
          });
          return comment;
        })
        .filter(comment => comment.task_id === taskId);

      // Filtrar por tipo si se especifica
      if (commentType) {
        comments = comments.filter(comment => comment.comment_type === commentType);
      }

      // Ordenar por timestamp descendente (más reciente primero)
      comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return comments;

    } catch (error) {
      console.error("Error getting task comments:", error);
      throw error;
    }
  },

  // Obtener comentarios de un usuario específico
  getCommentsByUser: function(userId, taskId = null) {
    try {
      const sheet = getSheet("task_comments");
      if (!sheet) {
        throw new Error("task_comments sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      let comments = rows
        .map(row => {
          const comment = {};
          headers.forEach((header, index) => {
            comment[header] = row[index];
          });
          return comment;
        })
        .filter(comment => comment.user_id === userId);

      // Filtrar por tarea si se especifica
      if (taskId) {
        comments = comments.filter(comment => comment.task_id === taskId);
      }

      // Ordenar por timestamp descendente
      comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return comments;

    } catch (error) {
      console.error("Error getting comments by user:", error);
      throw error;
    }
  },

  // Obtener estadísticas de comentarios por tarea
  getCommentStatistics: function(taskId) {
    try {
      const comments = this.getTaskComments(taskId);
      
      const stats = {
        total_comments: comments.length,
        comment_types: {},
        users: {},
        first_comment: null,
        last_comment: null
      };

      if (comments.length > 0) {
        // Ordenar cronológicamente para obtener primero y último
        const chronological = [...comments].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        stats.first_comment = chronological[0];
        stats.last_comment = chronological[chronological.length - 1];

        // Contar por tipo y usuario
        comments.forEach(comment => {
          // Por tipo
          if (!stats.comment_types[comment.comment_type]) {
            stats.comment_types[comment.comment_type] = 0;
          }
          stats.comment_types[comment.comment_type]++;

          // Por usuario
          if (!stats.users[comment.user_id]) {
            stats.users[comment.user_id] = 0;
          }
          stats.users[comment.user_id]++;
        });
      }

      return stats;

    } catch (error) {
      console.error("Error getting comment statistics:", error);
      throw error;
    }
  },

  // Obtener comentarios recientes del sistema
  getRecentComments: function(hoursBack = 24) {
    try {
      const sheet = getSheet("task_comments");
      if (!sheet) {
        throw new Error("task_comments sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      const recentComments = rows
        .map(row => {
          const comment = {};
          headers.forEach((header, index) => {
            comment[header] = row[index];
          });
          return comment;
        })
        .filter(comment => {
          const commentTime = new Date(comment.timestamp);
          return commentTime > cutoffTime;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return recentComments;

    } catch (error) {
      console.error("Error getting recent comments:", error);
      throw error;
    }
  },

  // Buscar comentarios por texto
  searchComments: function(searchText, taskId = null) {
    try {
      const sheet = getSheet("task_comments");
      if (!sheet) {
        throw new Error("task_comments sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      let comments = rows
        .map(row => {
          const comment = {};
          headers.forEach((header, index) => {
            comment[header] = row[index];
          });
          return comment;
        })
        .filter(comment => {
          const matchesText = comment.comment.toLowerCase().includes(searchText.toLowerCase());
          const matchesTask = taskId ? comment.task_id === taskId : true;
          return matchesText && matchesTask;
        });

      // Ordenar por timestamp descendente
      comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return comments;

    } catch (error) {
      console.error("Error searching comments:", error);
      throw error;
    }
  }
};

// Hacer CommentService disponible globalmente
this.CommentService = CommentService;