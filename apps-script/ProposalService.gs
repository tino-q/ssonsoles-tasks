// ProposalService - Manejo de propuestas de horario alternativo
// Permite a las limpiadoras proponer horarios alternativos y al admin gestionarlos

const ProposalService = {
  // Crear una propuesta de horario alternativo
  createProposal: function(taskId, userId, proposedTime, proposalReason = "") {
    try {
      const sheet = getSheet("task_proposals");
      if (!sheet) {
        throw new Error("task_proposals sheet not found");
      }

      // Validar que la tarea existe
      const task = TaskService.getTaskById(taskId);
      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      const newProposal = {
        id: generateId(),
        task_id: taskId,
        user_id: userId,
        proposed_time: proposedTime,
        proposal_reason: proposalReason,
        timestamp: new Date().toISOString(),
        status: "PENDING" // PENDING, APPROVED, REJECTED
      };

      // Obtener headers para orden correcto
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const values = headers.map(header => newProposal[header] || "");

      // Insertar propuesta
      sheet.appendRow(values);

      // Actualizar estado de la tarea a TENTATIVO
      TaskService.updateTaskStatus(taskId, "TENTATIVO", `Horario propuesto: ${proposedTime}. ${proposalReason}`, userId);

      console.log(`Proposal created for task ${taskId} by user ${userId}`);
      return newProposal;

    } catch (error) {
      console.error("Error creating proposal:", error);
      throw error;
    }
  },

  // Obtener todas las propuestas de una tarea
  getTaskProposals: function(taskId) {
    try {
      const sheet = getSheet("task_proposals");
      if (!sheet) {
        throw new Error("task_proposals sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const proposals = rows
        .map(row => {
          const proposal = {};
          headers.forEach((header, index) => {
            proposal[header] = row[index];
          });
          return proposal;
        })
        .filter(proposal => proposal.task_id === taskId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return proposals;

    } catch (error) {
      console.error("Error getting task proposals:", error);
      throw error;
    }
  },

  // Obtener propuestas por usuario
  getProposalsByUser: function(userId, status = null) {
    try {
      const sheet = getSheet("task_proposals");
      if (!sheet) {
        throw new Error("task_proposals sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      let proposals = rows
        .map(row => {
          const proposal = {};
          headers.forEach((header, index) => {
            proposal[header] = row[index];
          });
          return proposal;
        })
        .filter(proposal => proposal.user_id === userId);

      // Filtrar por status si se especifica
      if (status) {
        proposals = proposals.filter(proposal => proposal.status === status);
      }

      // Ordenar por timestamp descendente
      proposals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return proposals;

    } catch (error) {
      console.error("Error getting proposals by user:", error);
      throw error;
    }
  },

  // Obtener todas las propuestas pendientes (para admin)
  getPendingProposals: function() {
    try {
      const sheet = getSheet("task_proposals");
      if (!sheet) {
        throw new Error("task_proposals sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const pendingProposals = rows
        .map(row => {
          const proposal = {};
          headers.forEach((header, index) => {
            proposal[header] = row[index];
          });
          return proposal;
        })
        .filter(proposal => proposal.status === "PENDING")
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Más antigua primero

      return pendingProposals;

    } catch (error) {
      console.error("Error getting pending proposals:", error);
      throw error;
    }
  },

  // Aprobar una propuesta (admin)
  approveProposal: function(proposalId, adminId) {
    try {
      const sheet = getSheet("task_proposals");
      if (!sheet) {
        throw new Error("task_proposals sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const proposalIndex = headers.indexOf("id");
      const statusIndex = headers.indexOf("status");

      if (proposalIndex === -1 || statusIndex === -1) {
        throw new Error("Required columns not found");
      }

      // Encontrar la propuesta
      let targetRow = -1;
      let proposal = null;

      for (let i = 1; i < data.length; i++) {
        if (data[i][proposalIndex] === proposalId) {
          targetRow = i + 1;
          proposal = {};
          headers.forEach((header, index) => {
            proposal[header] = data[i][index];
          });
          break;
        }
      }

      if (targetRow === -1) {
        throw new Error("Proposal not found");
      }

      // Actualizar estado de la propuesta
      sheet.getRange(targetRow, statusIndex + 1).setValue("APPROVED");

      // Actualizar la tarea con el horario propuesto
      TaskService.updateTask({
        id: proposal.task_id,
        date: proposal.proposed_time, // Asumiendo que proposed_time es la nueva fecha
        status: "CONFIR",
        last_updated_by: adminId
      });

      console.log(`Proposal ${proposalId} approved by admin ${adminId}`);
      return { success: true, proposal: proposal };

    } catch (error) {
      console.error("Error approving proposal:", error);
      throw error;
    }
  },

  // Rechazar una propuesta (admin)
  rejectProposal: function(proposalId, adminId, rejectionReason = "") {
    try {
      const sheet = getSheet("task_proposals");
      if (!sheet) {
        throw new Error("task_proposals sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const proposalIndex = headers.indexOf("id");
      const statusIndex = headers.indexOf("status");

      if (proposalIndex === -1 || statusIndex === -1) {
        throw new Error("Required columns not found");
      }

      // Encontrar la propuesta
      let targetRow = -1;
      let proposal = null;

      for (let i = 1; i < data.length; i++) {
        if (data[i][proposalIndex] === proposalId) {
          targetRow = i + 1;
          proposal = {};
          headers.forEach((header, index) => {
            proposal[header] = data[i][index];
          });
          break;
        }
      }

      if (targetRow === -1) {
        throw new Error("Proposal not found");
      }

      // Actualizar estado de la propuesta
      sheet.getRange(targetRow, statusIndex + 1).setValue("REJECTED");

      // Actualizar la tarea de vuelta a ESP_OK para nueva asignación
      TaskService.updateTaskStatus(
        proposal.task_id, 
        "ESP_OK", 
        `Propuesta rechazada: ${rejectionReason}`, 
        adminId
      );

      console.log(`Proposal ${proposalId} rejected by admin ${adminId}`);
      return { success: true, proposal: proposal };

    } catch (error) {
      console.error("Error rejecting proposal:", error);
      throw error;
    }
  },

  // Obtener estadísticas de propuestas
  getProposalStatistics: function(daysBack = 30) {
    try {
      const sheet = getSheet("task_proposals");
      if (!sheet) {
        throw new Error("task_proposals sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const recentProposals = rows
        .map(row => {
          const proposal = {};
          headers.forEach((header, index) => {
            proposal[header] = row[index];
          });
          return proposal;
        })
        .filter(proposal => {
          const proposalTime = new Date(proposal.timestamp);
          return proposalTime > cutoffTime;
        });

      const stats = {
        total_proposals: recentProposals.length,
        proposals_by_status: {},
        proposals_by_user: {},
        approval_rate: 0,
        average_response_time: 0
      };

      // Procesar estadísticas
      recentProposals.forEach(proposal => {
        // Por status
        if (!stats.proposals_by_status[proposal.status]) {
          stats.proposals_by_status[proposal.status] = 0;
        }
        stats.proposals_by_status[proposal.status]++;

        // Por usuario
        if (!stats.proposals_by_user[proposal.user_id]) {
          stats.proposals_by_user[proposal.user_id] = 0;
        }
        stats.proposals_by_user[proposal.user_id]++;
      });

      // Calcular tasa de aprobación
      const approved = stats.proposals_by_status["APPROVED"] || 0;
      const rejected = stats.proposals_by_status["REJECTED"] || 0;
      const total = approved + rejected;
      stats.approval_rate = total > 0 ? (approved / total) * 100 : 0;

      return stats;

    } catch (error) {
      console.error("Error getting proposal statistics:", error);
      throw error;
    }
  },

  // Obtener propuestas por horario más comúnmente propuesto
  getCommonProposedTimes: function() {
    try {
      const sheet = getSheet("task_proposals");
      if (!sheet) {
        throw new Error("task_proposals sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const timeFrequency = {};

      rows.forEach(row => {
        const proposal = {};
        headers.forEach((header, index) => {
          proposal[header] = row[index];
        });

        const proposedTime = proposal.proposed_time;
        if (proposedTime) {
          if (!timeFrequency[proposedTime]) {
            timeFrequency[proposedTime] = 0;
          }
          timeFrequency[proposedTime]++;
        }
      });

      // Ordenar por frecuencia
      const sortedTimes = Object.entries(timeFrequency)
        .sort(([,a], [,b]) => b - a)
        .map(([time, count]) => ({time, count}));

      return sortedTimes;

    } catch (error) {
      console.error("Error getting common proposed times:", error);
      throw error;
    }
  }
};

// Hacer ProposalService disponible globalmente
this.ProposalService = ProposalService;