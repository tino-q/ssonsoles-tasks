import { useState } from "react";
import { useTranslation } from 'react-i18next';
import TaskCommentsSection from "./TaskCommentsSection";
import { useApiRequest } from "../hooks/useApiRequest";

function TaskCard({ task, onResponse, onStart, currentUser }) {
  const [showResponse, setShowResponse] = useState(false);
  const [comments, setComments] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");
  const [showComments, setShowComments] = useState(false);
  const { executeRequest } = useApiRequest();
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    switch (status) {
      case "URGENTE":
        return "#ff4444";
      case "ESP_OK":
        return "#ffaa00";
      case "CONFIR":
        return "#00aa00";
      case "REJECTED":
        return "#ff8800";
      case "TENTATIVO":
        return "#0088ff";
      default:
        return "#666666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "URGENTE":
        return t('status.urgente');
      case "ESP_OK":
        return t('status.espOk');
      case "CONFIR":
        return t('status.confir');
      case "REJECTED":
        return t('status.rejected');
      case "TENTATIVO":
        return t('status.tentativo');
      default:
        return status;
    }
  };

  const handleConfirm = () => {
    onResponse(task.id, "CONFIR", comments);
    setShowResponse(false);
    setComments("");
  };

  const handleReject = async () => {
    try {
      // Import api here to avoid circular dependency
      const api = (await import('../services/api')).default;
      
      // Log rejection using the specific API
      await executeRequest(
        () => api.logRejection(task.id, currentUser.id, comments || t('response.rejected')),
        "loading.rejecting"
      );
      
      // Refresh parent component
      onResponse(task.id, "REJECTED", "");
    } catch (error) {
      console.error("Error logging rejection:", error);
    }
    
    setShowResponse(false);
    setComments("");
  };

  const handleTentative = async () => {
    try {
      // Import api here to avoid circular dependency
      const api = (await import('../services/api')).default;
      
      // Create a proposal using the specific API
      await executeRequest(
        () => api.createProposal(task.id, currentUser.id, suggestedTime, comments || t('response.alternativeTime')),
        "loading.creating"
      );
      
      // Refresh parent component
      onResponse(task.id, "TENTATIVO", "");
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
    
    setShowResponse(false);
    setComments("");
    setSuggestedTime("");
  };

  const canStart = task.status === "CONFIR";
  const needsResponse = task.status === "ESP_OK";

  return (
    <div
      className="task-card"
      style={{ borderLeft: `4px solid ${getStatusColor(task.status)}` }}
    >
      <div className="task-header">
        <h3>{task.property}</h3>
        <span
          className="task-status"
          style={{ color: getStatusColor(task.status) }}
        >
          {getStatusText(task.status)}
        </span>
      </div>

      <div className="task-details">
        <div className="task-date">
          📅 {new Date(task.date).toLocaleDateString("es-ES")}
        </div>
        <div className="task-type">🧹 {task.type || t('task.type.cleaning')}</div>
        {task.notes && <div className="task-notes">📝 {task.notes}</div>}
      </div>

      <div className="task-actions">
        {needsResponse && (
          <>
            {!showResponse ? (
              <button
                onClick={() => setShowResponse(true)}
                className="btn-primary"
              >
                {t('task.respond')}
              </button>
            ) : (
              <div className="response-form">
                <div className="form-group">
                  <label>{t('response.comments')}</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={t('response.commentsPlaceholder')}
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>{t('response.suggestTime')}</label>
                  <input
                    type="time"
                    value={suggestedTime}
                    onChange={(e) => setSuggestedTime(e.target.value)}
                  />
                </div>

                <div className="response-buttons">
                  <button onClick={handleConfirm} className="btn-confirm">
                    {t('task.confirm')}
                  </button>
                  <button onClick={handleReject} className="btn-reject">
                    {t('task.reject')}
                  </button>
                  {suggestedTime && (
                    <button onClick={handleTentative} className="btn-tentative">
                      {t('task.propose')}
                    </button>
                  )}
                  <button
                    onClick={() => setShowResponse(false)}
                    className="btn-cancel"
                  >
                    {t('task.cancel')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {canStart && (
          <button onClick={() => onStart(task)} className="btn-start">
            {t('task.begin')}
          </button>
        )}
      </div>

      <TaskCommentsSection
        taskId={task.id}
        currentUser={currentUser}
        isExpanded={showComments}
        onToggle={() => setShowComments(!showComments)}
      />
    </div>
  );
}

export default TaskCard;
