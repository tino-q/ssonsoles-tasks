// Cleaner Service - Handles cleaner-related operations

const CleanerService = {
  
  // Get all active cleaners
  getCleaners: function() {
    const sheet = getSheet('cleaners');
    if (!sheet) throw new Error('Cleaners sheet not found');
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const cleaners = rows.map(row => {
      const cleaner = {};
      headers.forEach((header, index) => {
        cleaner[header] = row[index];
      });
      return cleaner;
    }).filter(cleaner => cleaner.id && cleaner.active); // Only return active cleaners
    
    return cleaners;
  },
  
  // Get cleaner by ID
  getCleanerById: function(cleanerId) {
    const cleaners = this.getCleaners();
    return cleaners.find(cleaner => cleaner.id == cleanerId);
  },
  
  // Get cleaner by phone number (for login)
  getCleanerByPhone: function(phone) {
    const cleaners = this.getCleaners();
    return cleaners.find(cleaner => cleaner.phone === phone);
  },
  
  // Add a new cleaner
  addCleaner: function(cleanerData) {
    const sheet = getSheet('cleaners');
    if (!sheet) throw new Error('Cleaners sheet not found');
    
    // Generate new ID
    const existingCleaners = this.getCleaners();
    const maxId = Math.max(...existingCleaners.map(c => parseInt(c.id) || 0));
    const newId = maxId + 1;
    
    const newCleaner = {
      id: newId,
      name: cleanerData.name,
      phone: cleanerData.phone,
      hourly_rate: cleanerData.hourly_rate || 15,
      active: true
    };
    
    // Get headers to ensure correct column order
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const values = headers.map(header => newCleaner[header] || '');
    
    sheet.appendRow(values);
    
    return newCleaner;
  },
  
  // Update cleaner information
  updateCleaner: function(cleanerId, updateData) {
    const sheet = getSheet('cleaners');
    if (!sheet) throw new Error('Cleaners sheet not found');
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) throw new Error('ID column not found');
    
    // Find the cleaner row
    let targetRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == cleanerId) {
        targetRow = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (targetRow === -1) throw new Error('Cleaner not found');
    
    // Update specific columns
    Object.keys(updateData).forEach(key => {
      const columnIndex = headers.indexOf(key);
      if (columnIndex !== -1) {
        sheet.getRange(targetRow, columnIndex + 1).setValue(updateData[key]);
      }
    });
    
    return { success: true, updated: updateData };
  },
  
  // Deactivate a cleaner (soft delete)
  deactivateCleaner: function(cleanerId) {
    return this.updateCleaner(cleanerId, { active: false });
  },
  
  // Get cleaner's task statistics
  getCleanerStats: function(cleanerId, startDate = null, endDate = null) {
    const tasks = TaskService.getTasks({ cleanerId: cleanerId });
    
    let filteredTasks = tasks;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= start && taskDate <= end;
      });
    }
    
    const stats = {
      total_tasks: filteredTasks.length,
      completed_tasks: filteredTasks.filter(t => t.status === 'COMPLETED').length,
      confirmed_tasks: filteredTasks.filter(t => t.status === 'CONFIRMED').length,
      pending_tasks: filteredTasks.filter(t => t.status === 'PENDING').length,
      rejected_tasks: filteredTasks.filter(t => t.status === 'REJECTED').length,
      total_hours: 0
    };
    
    // Calculate total hours worked
    filteredTasks.forEach(task => {
      if (task.start_time && task.end_time) {
        const start = new Date(task.start_time);
        const end = new Date(task.end_time);
        const hours = (end - start) / (1000 * 60 * 60); // Convert to hours
        if (hours > 0 && hours < 24) { // Sanity check
          stats.total_hours += hours;
        }
      }
    });
    
    stats.total_hours = Math.round(stats.total_hours * 100) / 100; // Round to 2 decimal places
    
    return stats;
  }
};

// Make CleanerService available globally
this.CleanerService = CleanerService;