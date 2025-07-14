import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import TaskCard from "./TaskCard";
import TaskExecution from "./TaskExecution";
import api from "../services/api";
import { useApiRequest } from "../hooks/useApiRequest";

function CleanerPanel({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { executeRequest } = useApiRequest();
  const { t } = useTranslation();

  useEffect(() => {
    if (currentUser && currentUser.id) {
      loadTasks();
    }
  }, [currentUser?.id]); // Solo reaccionar a cambios de ID, no a cambios de lastActivity

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await executeRequest(
        () => api.getTasks({ cleanerId: currentUser.id }),
        "loading.tasks"
      );

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
        setError(response.data?.error || t('tasks.error.load'));
        setTasks([]); // Ensure tasks is always an array
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setError(t('tasks.error.load'));
      setTasks([]); // Ensure tasks is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setError("");
      const response = await executeRequest(
        () => api.getTasks({ cleanerId: currentUser.id }),
        "loading.refreshing"
      );

      if (response.success && Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        console.error("Invalid tasks response:", response);
        setError(response.data?.error || t('tasks.error.refresh'));
        setTasks([]);
      }
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
      setError(t('tasks.error.refresh'));
      setTasks([]);
    }
  };

  const handleTaskResponse = async (taskId, status, comments = "") => {
    try {
      await executeRequest(
        () => api.updateTaskStatus(taskId, status, comments),
        "loading.updateTask"
      );
      await loadTasks(); // Refresh tasks
    } catch (error) {
      console.error("Failed to update task:", error);
      setError(t('tasks.error.update'));
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
    return <div className="loading">{t('loading.tasks')}</div>;
  }

  if (activeTask) {
    return (
      <TaskExecution
        task={activeTask}
        onComplete={handleCompleteTask}
        onBack={() => setActiveTask(null)}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="cleaner-panel">
      <div className="panel-header">
        <div className="header-title">
          <h2>{t('tasks.title')}</h2>
          <button
            onClick={handleRefresh}
            className="refresh-btn"
            title={t('common.refresh')}
          >
            ↻
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="task-filters">
          <button className="active">{t('tasks.all', { count: safeTasks.length })}</button>
        </div>
      </div>

      <div className="tasks-list">
        {safeTasks.length === 0 ? (
          <div className="no-tasks">
            {error ? (
              <div>
                <p>{t('tasks.unableToLoad')}</p>
                <button onClick={loadTasks}>{t('tasks.tryAgain')}</button>
              </div>
            ) : (
              t('tasks.noTasks')
            )}
          </div>
        ) : (
          safeTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onResponse={handleTaskResponse}
              onStart={handleStartTask}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CleanerPanel;
