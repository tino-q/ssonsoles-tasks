import { useState } from "react";

function TaskCard({ task, onResponse, onStart }) {
  const [showResponse, setShowResponse] = useState(false);
  const [comments, setComments] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "URGENT":
        return "#ff4444";
      case "ASSIGNED":
        return "#ffaa00";
      case "CONFIRMED":
        return "#00aa00";
      case "REJECTED":
        return "#ff8800";
      case "TENTATIVE":
        return "#0088ff";
      default:
        return "#666666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "URGENT":
        return "Urgent - Not Assigned";
      case "ASSIGNED":
        return "Assigned - Awaiting Response";
      case "CONFIRMED":
        return "Confirmed";
      case "REJECTED":
        return "Rejected";
      case "TENTATIVE":
        return "Alternative Time Proposed";
      default:
        return status;
    }
  };

  const handleConfirm = () => {
    onResponse(task.id, "CONFIRMED", comments);
    setShowResponse(false);
    setComments("");
  };

  const handleReject = () => {
    onResponse(task.id, "REJECTED", comments);
    setShowResponse(false);
    setComments("");
  };

  const handleTentative = () => {
    const tentativeComments = `Alternative time suggested: ${suggestedTime}${
      comments ? ". " + comments : ""
    }`;
    onResponse(task.id, "TENTATIVE", tentativeComments);
    setShowResponse(false);
    setComments("");
    setSuggestedTime("");
  };

  const canStart = task.status === "CONFIRMED";
  const needsResponse = task.status === "ASSIGNED";

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
        <div className="task-type">🧹 {task.type || "Cleaning"}</div>
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
                Respond to Task
              </button>
            ) : (
              <div className="response-form">
                <div className="form-group">
                  <label>Comments (optional):</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Any additional comments..."
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Suggest alternative time (optional):</label>
                  <input
                    type="time"
                    value={suggestedTime}
                    onChange={(e) => setSuggestedTime(e.target.value)}
                  />
                </div>

                <div className="response-buttons">
                  <button onClick={handleConfirm} className="btn-confirm">
                    ✅ Confirm
                  </button>
                  <button onClick={handleReject} className="btn-reject">
                    ❌ Reject
                  </button>
                  {suggestedTime && (
                    <button onClick={handleTentative} className="btn-tentative">
                      🕒 Propose Time
                    </button>
                  )}
                  <button
                    onClick={() => setShowResponse(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {canStart && (
          <button onClick={() => onStart(task)} className="btn-start">
            📋 Begin Task
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
