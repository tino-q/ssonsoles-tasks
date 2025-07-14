/**
 * Database Reset Service
 * Provides functionality to reset the entire database by deleting all sheets
 * and recreating them with seed data
 */

/**
 * MANUAL EXECUTION FUNCTION
 * Run this function manually to reset the entire database
 */
function resetDatabase() {
  console.log("Starting database reset...");
  
  try {
    // Delete all existing sheets except the first one (which will be recreated)
    deleteAllSheets();
    
    // Create all sheets with proper headers
    createAllSheets();
    
    // Populate with seed data
    populateWithSeedData();
    
    console.log("Database reset completed successfully!");
    return "Database reset completed successfully!";
    
  } catch (error) {
    console.error("Error during database reset:", error);
    throw new Error("Database reset failed: " + error.message);
  }
}

/**
 * Delete all existing sheets except the first one
 */
function deleteAllSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  
  // Keep only the first sheet, delete all others
  for (let i = sheets.length - 1; i > 0; i--) {
    spreadsheet.deleteSheet(sheets[i]);
  }
  
  // Rename the first sheet to 'reservations'
  sheets[0].setName('reservations');
  console.log("Deleted all existing sheets");
}

/**
 * Create all required sheets with proper headers
 */
function createAllSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet configurations with headers
  const sheetConfigs = [
    {
      name: 'tasks',
      headers: ['id', 'property', 'type', 'date', 'status', 'assigned_cleaner_id', 'created_at', 'updated_at', 'created_by', 'last_updated_by']
    },
    {
      name: 'cleaners',
      headers: ['id', 'name', 'phone', 'hourly_rate', 'active']
    },
    {
      name: 'products',
      headers: ['id', 'name', 'category', 'min_stock']
    },
    {
      name: 'task_events',
      headers: ['snapshot_id', 'task_id', 'property', 'type', 'date', 'status', 'assigned_cleaner_id', 'created_at', 'updated_at', 'created_by', 'last_updated_by', 'snapshot_timestamp', 'changed_by']
    },
    {
      name: 'task_comments',
      headers: ['id', 'task_id', 'user_id', 'comment', 'timestamp', 'comment_type']
    },
    {
      name: 'task_rejections',
      headers: ['id', 'task_id', 'user_id', 'rejection_reason', 'timestamp', 'previous_cleaner_id']
    },
    {
      name: 'task_proposals',
      headers: ['id', 'task_id', 'user_id', 'proposed_time', 'proposal_reason', 'timestamp', 'status']
    },
    {
      name: 'task_timings',
      headers: ['id', 'task_id', 'user_id', 'event_type', 'timestamp', 'recorded_at']
    },
    {
      name: 'task_product_usage',
      headers: ['id', 'task_id', 'user_id', 'product_id', 'quantity', 'notes', 'timestamp']
    },
    {
      name: 'product_requests',
      headers: ['id', 'task_id', 'product_id', 'quantity', 'request_date']
    }
  ];
  
  // Set headers for reservations sheet (first sheet)
  const reservationsSheet = spreadsheet.getSheetByName('reservations');
  reservationsSheet.clear();
  reservationsSheet.getRange(1, 1, 1, 4).setValues([['property', 'checkin_date', 'checkout_date', 'notes']]);
  
  // Create other sheets
  sheetConfigs.forEach(config => {
    const sheet = spreadsheet.insertSheet(config.name);
    sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
  });
  
  console.log("Created all sheets with headers");
}

/**
 * Populate all sheets with seed data
 */
function populateWithSeedData() {
  const seedData = {
    reservations: [
      ['Villa Moderna', '2024-07-15', '2024-07-18', 'Checkout estándar'],
      ['Casa del Mar', '2024-07-16', '2024-07-19', 'Revisar persiana rota']
    ],
    tasks: [
      ['task_1721000000_abc123', 'Villa Moderna', 'cleaning', '2024-07-17', 'URGENTE', '', '2024-07-14T10:00:00Z', '2024-07-14T10:00:00Z', 'admin', 'admin'],
      ['task_1721000001_def456', 'Villa Moderna', 'cleaning', '2024-07-18', 'CONFIR', '1', '2024-07-14T10:30:00Z', '2024-07-15T09:00:00Z', 'admin', 'user_1']
    ],
    cleaners: [
      ['1', 'María González', '+34612345678', '15', 'true'],
      ['2', 'Ana Martínez', '+34698765432', '16', 'true']
    ],
    products: [
      ['1', 'Detergente multiusos', 'cleaning', '5'],
      ['2', 'Papel higiénico', 'supplies', '20']
    ],
    task_events: [
      ['snap_1721000000_abc', 'task_1721000000_abc123', 'Villa Moderna', 'cleaning', '2024-07-17', 'URGENTE', '', '2024-07-14T10:00:00Z', '2024-07-14T10:00:00Z', 'admin', 'admin', '2024-07-14T10:00:00Z', 'admin'],
      ['snap_1721000001_def', 'task_1721000001_def456', 'Villa Moderna', 'cleaning', '2024-07-18', 'ESP_OK', '1', '2024-07-14T10:30:00Z', '2024-07-15T09:00:00Z', 'admin', 'user_1', '2024-07-15T09:00:00Z', 'admin'],
      ['snap_1721000002_ghi', 'task_1721000001_def456', 'Villa Moderna', 'cleaning', '2024-07-18', 'CONFIR', '1', '2024-07-14T10:30:00Z', '2024-07-15T09:30:00Z', 'admin', 'user_1', '2024-07-15T09:30:00Z', 'user_1']
    ],
    task_comments: [
      ['comment_1721000000_abc', 'task_1721000000_abc123', 'admin', 'Limpieza urgente para huéspedes VIP', '2024-07-14T10:00:00Z', 'INITIAL'],
      ['comment_1721000001_def', 'task_1721000001_def456', 'admin', 'Limpieza estándar post-checkout', '2024-07-14T10:30:00Z', 'INITIAL'],
      ['comment_1721000002_ghi', 'task_1721000001_def456', '1', 'Confirmado para mañana a las 9:00', '2024-07-15T09:00:00Z', 'CONFIRMATION']
    ],
    task_rejections: [
      ['rejection_1721000000_abc', 'task_1721000000_abc123', '2', 'No disponible esa fecha', '2024-07-14T14:00:00Z', '']
    ],
    task_proposals: [
      ['proposal_1721000000_abc', 'task_1721000000_abc123', '1', '2024-07-17T16:00:00Z', 'Mejor por la tarde', '2024-07-14T13:00:00Z', 'PENDING']
    ],
    task_timings: [
      ['timing_1721000000_entry', 'task_1721000001_def456', '1', 'ENTRY', '2024-07-18T09:00:00Z', '2024-07-18T09:00:00Z'],
      ['timing_1721000001_exit', 'task_1721000001_def456', '1', 'EXIT', '2024-07-18T12:00:00Z', '2024-07-18T12:00:00Z']
    ],
    task_product_usage: [
      ['usage_1721000000_abc', 'task_1721000001_def456', '1', '1', '2', 'Necesario para baño', '2024-07-18T10:30:00Z'],
      ['usage_1721000001_def', 'task_1721000001_def456', '1', '2', '4', 'Reponer todos los baños', '2024-07-18T11:00:00Z']
    ],
    product_requests: [
      ['req_1721000000_abc', 'task_1721000001_def456', '1', '3', '2024-07-18T11:30:00Z']
    ]
  };
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Populate each sheet with its seed data
  Object.keys(seedData).forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    const data = seedData[sheetName];
    
    if (data.length > 0) {
      const range = sheet.getRange(2, 1, data.length, data[0].length);
      range.setValues(data);
    }
  });
  
  console.log("Populated all sheets with seed data");
}

/**
 * Alternative function to reset only specific sheets
 * @param {string[]} sheetNames - Array of sheet names to reset
 */
function resetSpecificSheets(sheetNames) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  sheetNames.forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      // Clear all data except headers
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }
    }
  });
  
  console.log(`Reset specific sheets: ${sheetNames.join(', ')}`);
}

/**
 * Function to backup current data before reset
 */
function backupCurrentData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const backupSpreadsheet = SpreadsheetApp.create(`Backup_${spreadsheet.getName()}_${new Date().toISOString().split('T')[0]}`);
  
  const sheets = spreadsheet.getSheets();
  
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    const data = sheet.getDataRange().getValues();
    
    if (data.length > 0) {
      const backupSheet = backupSpreadsheet.insertSheet(sheetName);
      backupSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    }
  });
  
  console.log(`Backup created: ${backupSpreadsheet.getUrl()}`);
  return backupSpreadsheet.getUrl();
}