import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TaskExecution from "./TaskExecution";
import api from "../services/api";

function CleanerPanel({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // 'pending', 'confirmed', 'all'

  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.getTasks({ cleanerId: currentUser.id });
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskResponse = async (taskId, status, comments = "") => {
    try {
      await api.updateTaskStatus(taskId, status, comments);
      await loadTasks(); // Refresh tasks
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleStartTask = (task) => {
    setActiveTask(task);
  };

  const handleCompleteTask = async () => {
    await loadTasks(); // Refresh tasks
    setActiveTask(null);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return task.status === "PENDING";
    if (filter === "confirmed") return task.status === "CONFIRMED";
    return true;
  });

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
        <h2>Your Tasks</h2>
        <div className="task-filters">
          <button
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "active" : ""}
          >
            Pending ({tasks.filter((t) => t.status === "PENDING").length})
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={filter === "confirmed" ? "active" : ""}
          >
            Confirmed ({tasks.filter((t) => t.status === "CONFIRMED").length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
          >
            All ({tasks.length})
          </button>
        </div>
      </div>

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            {filter === "pending"
              ? "No pending tasks"
              : filter === "confirmed"
              ? "No confirmed tasks"
              : "No tasks assigned"}
          </div>
        ) : (
          filteredTasks.map((task) => (
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
