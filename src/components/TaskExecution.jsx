import { useState, useEffect } from "react";
import api from "../services/api";

function TaskExecution({ task, onComplete, onBack }) {
  const [phase, setPhase] = useState("start"); // 'start', 'in-progress', 'end'
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [startVideo, setStartVideo] = useState(null);
  const [endVideo, setEndVideo] = useState(null);
  const [comments, setComments] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");

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
      const response = await api.getProducts();

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

  const handleStart = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setPhase("in-progress");
  };

  const handleEnd = () => {
    const now = new Date().toISOString();
    setEndTime(now);
    setPhase("end");
  };

  const handleVideoUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to cloud storage
      // For now, we'll just store the file reference
      const videoUrl = URL.createObjectURL(file);
      if (type === "start") {
        setStartVideo(videoUrl);
      } else {
        setEndVideo(videoUrl);
      }
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
      // Update task with execution data
      await api.updateTask(task.id, {
        start_time: startTime,
        end_time: endTime,
        comments: comments,
        start_video: startVideo,
        end_video: endVideo,
        status: "COMPLETED",
      });

      // Submit product requests if any
      if (selectedProducts.length > 0) {
        await api.requestProducts(task.id, selectedProducts);
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
          <p>Record a short video showing the initial state of the property.</p>

          <div className="video-upload">
            <label>Start Video:</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoUpload(e, "start")}
              capture="environment"
            />
            {startVideo && (
              <video width="200" controls>
                <source src={startVideo} type="video/mp4" />
              </video>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={!startVideo}
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

          <div className="video-upload">
            <label>End Video:</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoUpload(e, "end")}
              capture="environment"
            />
            {endVideo && (
              <video width="200" controls>
                <source src={endVideo} type="video/mp4" />
              </video>
            )}
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
              <h4>Products Requested:</h4>
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
            disabled={!endVideo}
            className="btn-primary btn-large"
          >
            📋 Submit Report
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskExecution;
