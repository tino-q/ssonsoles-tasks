import { useState, useEffect } from "react";
import api from "../services/api";
import { useApiRequest } from "../hooks/useApiRequest";

function TaskExecution({ task, onComplete, onBack, currentUser }) {
  const [phase, setPhase] = useState("start"); // 'start', 'in-progress', 'end'
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [comments, setComments] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const { executeRequest } = useApiRequest();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diff = (end - start) / 1000 / 60; // minutes
      setDuration(`${Math.floor(diff / 60)}h ${Math.floor(diff % 60)}m`);
    }
  }, [startTime, endTime]);

  const loadProducts = async () => {
    try {
      setProductsError("");
      const response = await executeRequest(
        () => api.getProducts(),
        "Cargando productos..."
      );

      // Check if the response is successful and data is an array
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        // Handle error response or invalid data
        console.error("Invalid products response:", response);
        setProductsError(response.data?.error || "Failed to load products");
        setProducts([]); // Ensure products is always an array
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setProductsError("Failed to load products");
      setProducts([]); // Ensure products is always an array
    }
  };

  const handleStart = async () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setPhase("in-progress");
    
    // Log entry using TimingService
    try {
      await executeRequest(
        () => api.logEntry(task.id, currentUser.id, now),
        "Iniciando tarea..."
      );
    } catch (error) {
      console.error("Error logging entry:", error);
    }
  };

  const handleEnd = async () => {
    const now = new Date().toISOString();
    setEndTime(now);
    setPhase("end");
    
    // Log exit using TimingService
    try {
      await executeRequest(
        () => api.logExit(task.id, currentUser.id, now),
        "Finalizando tarea..."
      );
    } catch (error) {
      console.error("Error logging exit:", error);
    }
  };

  const handleProductToggle = (productId, quantity = 1) => {
    const existing = selectedProducts.find((p) => p.productId === productId);
    if (existing) {
      setSelectedProducts(
        selectedProducts.filter((p) => p.productId !== productId)
      );
    } else {
      setSelectedProducts([...selectedProducts, { productId, quantity }]);
    }
  };

  const handleComplete = async () => {
    try {
      // Update task status to COMPLETED
      await executeRequest(
        () => api.updateTaskStatus(task.id, "COMPLETED", comments),
        "Completando tarea..."
      );

      // Add final comments if any
      if (comments) {
        await executeRequest(
          () => api.addComment(task.id, currentUser.id, comments, "COMPLETION"),
          "Guardando comentarios..."
        );
      }

      // Log product usage if any
      if (selectedProducts.length > 0) {
        await executeRequest(
          () => api.logMultipleProductUsage(task.id, currentUser.id, selectedProducts),
          "Registrando uso de productos..."
        );
      }

      onComplete();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="task-execution">
      <div className="execution-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h2>
          {task.property} - {task.type}
        </h2>
        <div className="task-date">
          {new Date(task.date).toLocaleDateString("es-ES")}
        </div>
      </div>

      {phase === "start" && (
        <div className="start-phase">
          <h3>Ready to Start?</h3>
          <p>Click the button when you're ready to begin cleaning.</p>

          <button
            onClick={handleStart}
            className="btn-primary btn-large"
          >
            🚀 Start Cleaning
          </button>
        </div>
      )}

      {phase === "in-progress" && (
        <div className="progress-phase">
          <h3>Cleaning in Progress</h3>
          <div className="timer">
            Started: {new Date(startTime).toLocaleTimeString()}
          </div>

          <div className="products-section">
            <h4>Need any products?</h4>
            {productsError ? (
              <div className="error-message">
                {productsError}
                <button onClick={loadProducts}>Try Again</button>
              </div>
            ) : (
              <div className="products-grid">
                {safeProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`product-item ${
                      selectedProducts.find((p) => p.productId === product.id)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    {product.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleEnd} className="btn-primary btn-large">
            ✅ Finish Cleaning
          </button>
        </div>
      )}

      {phase === "end" && (
        <div className="end-phase">
          <h3>Cleaning Complete</h3>

          <div className="summary">
            <div>Start: {new Date(startTime).toLocaleTimeString()}</div>
            <div>End: {new Date(endTime).toLocaleTimeString()}</div>
            <div>Duration: {duration}</div>
          </div>

          <div className="comments-section">
            <label>Comments:</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any issues, observations, or notes..."
              rows="4"
            />
          </div>

          {selectedProducts.length > 0 && (
            <div className="selected-products">
              <h4>Products Used:</h4>
              <ul>
                {selectedProducts.map((sp) => {
                  const product = safeProducts.find(
                    (p) => p.id === sp.productId
                  );
                  return (
                    <li key={sp.productId}>
                      {product?.name} (Qty: {sp.quantity})
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <button
            onClick={handleComplete}
            className="btn-primary btn-large"
          >
            📋 Complete Task
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskExecution;
