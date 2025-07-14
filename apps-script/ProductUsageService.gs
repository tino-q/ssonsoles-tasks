// ProductUsageService - Manejo de eventos de uso de productos en tareas
// Almacena eventos de productos en lugar de mutaciones en tabla principal

const ProductUsageService = {
  // Registrar uso de producto en una tarea
  logProductUsage: function(taskId, userId, productId, quantity = 1, notes = "") {
    try {
      const sheet = getSheet("task_product_usage");
      if (!sheet) {
        throw new Error("task_product_usage sheet not found");
      }

      // Validar que la tarea existe
      const task = TaskService.getTaskById(taskId);
      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      // Validar que el producto existe
      const product = ProductService.getProductById(productId);
      if (!product) {
        throw new Error(`Product with id ${productId} not found`);
      }

      const newUsage = {
        id: generateId(),
        task_id: taskId,
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        notes: notes,
        timestamp: new Date().toISOString()
      };

      // Obtener headers para orden correcto
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const values = headers.map(header => newUsage[header] || "");

      // Insertar evento
      sheet.appendRow(values);

      console.log(`Product usage logged: ${quantity}x ${productId} for task ${taskId} by user ${userId}`);
      return newUsage;

    } catch (error) {
      console.error("Error logging product usage:", error);
      throw error;
    }
  },

  // Registrar múltiples productos usados en una tarea
  logMultipleProductUsage: function(taskId, userId, productUsages) {
    try {
      const results = [];
      
      for (const usage of productUsages) {
        const result = this.logProductUsage(
          taskId,
          userId,
          usage.product_id,
          usage.quantity || 1,
          usage.notes || ""
        );
        results.push(result);
      }

      return results;

    } catch (error) {
      console.error("Error logging multiple product usage:", error);
      throw error;
    }
  },

  // Obtener uso de productos de una tarea
  getTaskProductUsage: function(taskId) {
    try {
      const sheet = getSheet("task_product_usage");
      if (!sheet) {
        throw new Error("task_product_usage sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const usages = rows
        .map(row => {
          const usage = {};
          headers.forEach((header, index) => {
            usage[header] = row[index];
          });
          return usage;
        })
        .filter(usage => usage.task_id === taskId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return usages;

    } catch (error) {
      console.error("Error getting task product usage:", error);
      throw error;
    }
  },

  // Obtener uso de productos por usuario
  getProductUsageByUser: function(userId, daysBack = 30) {
    try {
      const sheet = getSheet("task_product_usage");
      if (!sheet) {
        throw new Error("task_product_usage sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const usages = rows
        .map(row => {
          const usage = {};
          headers.forEach((header, index) => {
            usage[header] = row[index];
          });
          return usage;
        })
        .filter(usage => {
          const usageTime = new Date(usage.timestamp);
          return usage.user_id === userId && usageTime > cutoffTime;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return usages;

    } catch (error) {
      console.error("Error getting product usage by user:", error);
      throw error;
    }
  },

  // Obtener uso de un producto específico
  getUsageByProduct: function(productId, daysBack = 30) {
    try {
      const sheet = getSheet("task_product_usage");
      if (!sheet) {
        throw new Error("task_product_usage sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const usages = rows
        .map(row => {
          const usage = {};
          headers.forEach((header, index) => {
            usage[header] = row[index];
          });
          return usage;
        })
        .filter(usage => {
          const usageTime = new Date(usage.timestamp);
          return usage.product_id === productId && usageTime > cutoffTime;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return usages;

    } catch (error) {
      console.error("Error getting usage by product:", error);
      throw error;
    }
  },

  // Obtener estadísticas de uso de productos
  getProductUsageStatistics: function(daysBack = 30) {
    try {
      const sheet = getSheet("task_product_usage");
      if (!sheet) {
        throw new Error("task_product_usage sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysBack);

      const recentUsages = rows
        .map(row => {
          const usage = {};
          headers.forEach((header, index) => {
            usage[header] = row[index];
          });
          return usage;
        })
        .filter(usage => {
          const usageTime = new Date(usage.timestamp);
          return usageTime > cutoffTime;
        });

      const stats = {
        total_usage_events: recentUsages.length,
        products_used: {},
        users_using_products: {},
        tasks_with_products: new Set(),
        top_products: [],
        top_users: []
      };

      // Procesar estadísticas
      recentUsages.forEach(usage => {
        // Por producto
        if (!stats.products_used[usage.product_id]) {
          stats.products_used[usage.product_id] = {
            product_id: usage.product_id,
            total_quantity: 0,
            usage_count: 0
          };
        }
        stats.products_used[usage.product_id].total_quantity += parseInt(usage.quantity) || 1;
        stats.products_used[usage.product_id].usage_count++;

        // Por usuario
        if (!stats.users_using_products[usage.user_id]) {
          stats.users_using_products[usage.user_id] = {
            user_id: usage.user_id,
            products_used: new Set(),
            usage_count: 0
          };
        }
        stats.users_using_products[usage.user_id].products_used.add(usage.product_id);
        stats.users_using_products[usage.user_id].usage_count++;

        // Tareas con productos
        stats.tasks_with_products.add(usage.task_id);
      });

      // Convertir sets a números
      Object.keys(stats.users_using_products).forEach(userId => {
        stats.users_using_products[userId].products_used = stats.users_using_products[userId].products_used.size;
      });

      stats.tasks_with_products = stats.tasks_with_products.size;

      // Ordenar tops
      stats.top_products = Object.values(stats.products_used)
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 10);

      stats.top_users = Object.values(stats.users_using_products)
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10);

      return stats;

    } catch (error) {
      console.error("Error getting product usage statistics:", error);
      throw error;
    }
  },

  // Obtener resumen de productos por tarea
  getTaskProductSummary: function(taskId) {
    try {
      const usages = this.getTaskProductUsage(taskId);
      
      const summary = {};
      
      usages.forEach(usage => {
        if (!summary[usage.product_id]) {
          summary[usage.product_id] = {
            product_id: usage.product_id,
            total_quantity: 0,
            usage_events: 0,
            users: new Set(),
            notes: []
          };
        }
        
        summary[usage.product_id].total_quantity += parseInt(usage.quantity) || 1;
        summary[usage.product_id].usage_events++;
        summary[usage.product_id].users.add(usage.user_id);
        
        if (usage.notes) {
          summary[usage.product_id].notes.push(usage.notes);
        }
      });

      // Convertir sets a arrays
      Object.keys(summary).forEach(productId => {
        summary[productId].users = Array.from(summary[productId].users);
      });

      return summary;

    } catch (error) {
      console.error("Error getting task product summary:", error);
      throw error;
    }
  },

  // Obtener productos más usados
  getMostUsedProducts: function(daysBack = 30, limit = 10) {
    try {
      const stats = this.getProductUsageStatistics(daysBack);
      return stats.top_products.slice(0, limit);

    } catch (error) {
      console.error("Error getting most used products:", error);
      throw error;
    }
  },

  // Obtener usuarios que más usan productos
  getMostActiveUsers: function(daysBack = 30, limit = 10) {
    try {
      const stats = this.getProductUsageStatistics(daysBack);
      return stats.top_users.slice(0, limit);

    } catch (error) {
      console.error("Error getting most active users:", error);
      throw error;
    }
  },

  // Buscar uso de productos por notas
  searchProductUsageByNotes: function(searchText) {
    try {
      const sheet = getSheet("task_product_usage");
      if (!sheet) {
        throw new Error("task_product_usage sheet not found");
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const matchingUsages = rows
        .map(row => {
          const usage = {};
          headers.forEach((header, index) => {
            usage[header] = row[index];
          });
          return usage;
        })
        .filter(usage => {
          return usage.notes && usage.notes.toLowerCase().includes(searchText.toLowerCase());
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return matchingUsages;

    } catch (error) {
      console.error("Error searching product usage by notes:", error);
      throw error;
    }
  }
};

// Hacer ProductUsageService disponible globalmente
this.ProductUsageService = ProductUsageService;