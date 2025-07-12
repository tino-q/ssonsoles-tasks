// Product Service - Handles product inventory and requests

const ProductService = {
  
  // Get all products
  getProducts: function() {
    const sheet = getSheet('products');
    if (!sheet) throw new Error('Products sheet not found');
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const products = rows.map(row => {
      const product = {};
      headers.forEach((header, index) => {
        product[header] = row[index];
      });
      return product;
    }).filter(product => product.id); // Filter out empty rows
    
    return products;
  },
  
  // Get products by category
  getProductsByCategory: function(category) {
    const products = this.getProducts();
    return products.filter(product => product.category === category);
  },
  
  // Add a new product
  addProduct: function(productData) {
    const sheet = getSheet('products');
    if (!sheet) throw new Error('Products sheet not found');
    
    // Generate new ID
    const existingProducts = this.getProducts();
    const maxId = Math.max(...existingProducts.map(p => parseInt(p.id) || 0));
    const newId = maxId + 1;
    
    const newProduct = {
      id: newId,
      name: productData.name,
      category: productData.category || 'general',
      min_stock: productData.min_stock || 0
    };
    
    // Get headers to ensure correct column order
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const values = headers.map(header => newProduct[header] || '');
    
    sheet.appendRow(values);
    
    return newProduct;
  },
  
  // Request products for a task
  requestProducts: function(taskId, productRequests) {
    const sheet = getSheet('product_requests');
    if (!sheet) throw new Error('Product requests sheet not found');
    
    const requests = [];
    const timestamp = new Date().toISOString();
    
    productRequests.forEach(request => {
      const requestId = generateId();
      
      const productRequest = {
        id: requestId,
        task_id: taskId,
        product_id: request.productId,
        quantity: request.quantity || 1,
        request_date: timestamp
      };
      
      // Get headers to ensure correct column order
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const values = headers.map(header => productRequest[header] || '');
      
      sheet.appendRow(values);
      requests.push(productRequest);
    });
    
    return {
      success: true,
      requests: requests
    };
  },
  
  // Get product requests for a task
  getTaskProductRequests: function(taskId) {
    const sheet = getSheet('product_requests');
    if (!sheet) throw new Error('Product requests sheet not found');
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const requests = rows.map(row => {
      const request = {};
      headers.forEach((header, index) => {
        request[header] = row[index];
      });
      return request;
    }).filter(request => request.task_id === taskId);
    
    // Enrich with product information
    const products = this.getProducts();
    const enrichedRequests = requests.map(request => {
      const product = products.find(p => p.id == request.product_id);
      return {
        ...request,
        product_name: product ? product.name : 'Unknown Product',
        product_category: product ? product.category : 'Unknown'
      };
    });
    
    return enrichedRequests;
  },
  
  // Get all product requests with optional filters
  getAllProductRequests: function(filters = {}) {
    const sheet = getSheet('product_requests');
    if (!sheet) throw new Error('Product requests sheet not found');
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    let requests = rows.map(row => {
      const request = {};
      headers.forEach((header, index) => {
        request[header] = row[index];
      });
      return request;
    }).filter(request => request.id);
    
    // Apply filters
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      
      requests = requests.filter(request => {
        const requestDate = new Date(request.request_date);
        return requestDate >= start && requestDate <= end;
      });
    }
    
    if (filters.productId) {
      requests = requests.filter(request => request.product_id == filters.productId);
    }
    
    // Enrich with product and task information
    const products = this.getProducts();
    const tasks = TaskService.getTasks();
    
    const enrichedRequests = requests.map(request => {
      const product = products.find(p => p.id == request.product_id);
      const task = tasks.find(t => t.id === request.task_id);
      
      return {
        ...request,
        product_name: product ? product.name : 'Unknown Product',
        product_category: product ? product.category : 'Unknown',
        task_property: task ? task.property : 'Unknown Property',
        task_date: task ? task.date : 'Unknown Date'
      };
    });
    
    return enrichedRequests;
  },
  
  // Get product request summary (for inventory management)
  getProductRequestSummary: function(startDate = null, endDate = null) {
    const filters = {};
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    
    const requests = this.getAllProductRequests(filters);
    const products = this.getProducts();
    
    const summary = {};
    
    products.forEach(product => {
      summary[product.id] = {
        product_name: product.name,
        category: product.category,
        min_stock: product.min_stock,
        total_requested: 0,
        request_count: 0
      };
    });
    
    requests.forEach(request => {
      if (summary[request.product_id]) {
        summary[request.product_id].total_requested += parseInt(request.quantity) || 0;
        summary[request.product_id].request_count += 1;
      }
    });
    
    return Object.values(summary).sort((a, b) => b.total_requested - a.total_requested);
  }
};

// Make ProductService available globally
this.ProductService = ProductService;