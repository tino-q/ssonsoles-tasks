import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TaskExecution from "./TaskExecution";
import api from "../services/api";

function CleanerPanel({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.getTasks({ cleanerId: currentUser.id });

      // Console log the response for debugging
      console.log("Tasks API Response:", response);
      console.log("Response data:", response.data);
      console.log("Response success:", response.success);

      // Check if the response is successful and data is an array
      if (response.success && Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        // Handle error response or invalid data
        console.error("Invalid tasks response:", response);
        setError(response.data?.error || "Failed to load tasks");
        setTasks([]); // Ensure tasks is always an array
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setError("Failed to load tasks. Please try again.");
      setTasks([]); // Ensure tasks is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      const response = await api.getTasks({ cleanerId: currentUser.id });

      if (response.success && Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        console.error("Invalid tasks response:", response);
        setError(response.data?.error || "Failed to refresh tasks");
        setTasks([]);
      }
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
      setError("Failed to refresh tasks. Please try again.");
      setTasks([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTaskResponse = async (taskId, status, comments = "") => {
    try {
      await api.updateTaskStatus(taskId, status, comments);
      await loadTasks(); // Refresh tasks
    } catch (error) {
      console.error("Failed to update task:", error);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleStartTask = (task) => {
    setActiveTask(task);
  };

  const handleCompleteTask = async () => {
    await loadTasks(); // Refresh tasks
    setActiveTask(null);
  };

  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  if (loading) {
    return <div className="loading">Loading your tasks...</div>;
  }

  if (activeTask) {
    return (
      <TaskExecution
        task={activeTask}
        onComplete={handleCompleteTask}
        onBack={() => setActiveTask(null)}
      />
    );
  }

  return (
    <div className="cleaner-panel">
      <div className="panel-header">
        <div className="header-title">
          <h2>Your Tasks</h2>
          <button
            onClick={handleRefresh}
            className="refresh-btn"
            disabled={refreshing}
            title="Refresh tasks"
          >
            {refreshing ? "🔄" : "↻"}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="task-filters">
          <button className="active">All ({safeTasks.length})</button>
        </div>
      </div>

      <div className="tasks-list">
        {safeTasks.length === 0 ? (
          <div className="no-tasks">
            {error ? (
              <div>
                <p>Unable to load tasks.</p>
                <button onClick={loadTasks}>Try Again</button>
              </div>
            ) : (
              "No tasks assigned"
            )}
          </div>
        ) : (
          safeTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onResponse={handleTaskResponse}
              onStart={handleStartTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CleanerPanel;
