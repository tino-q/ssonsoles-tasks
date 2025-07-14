import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import api from "../services/api";
import { useApiRequest } from "../hooks/useApiRequest";

function TaskCommentsSection({ taskId, currentUser, isExpanded, onToggle }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { executeRequest } = useApiRequest();
  const { t } = useTranslation();

  useEffect(() => {
    if (isExpanded && taskId) {
      loadComments();
    }
  }, [isExpanded, taskId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await executeRequest(
        () => api.getComments(taskId),
        "loading.comments"
      );
      
      if (response.success) {
        // Ordenar comentarios por timestamp (más reciente primero)
        const sortedComments = response.data.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setComments(sortedComments);
      } else {
        console.error("Error loading comments:", response);
        setComments([]);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await executeRequest(
        () => api.addComment(taskId, currentUser.id, newComment.trim()),
        "loading.sending"
      );
      
      if (response.success) {
        setNewComment("");
        await loadComments(); // Reload comments
      } else {
        console.error("Error adding comment:", response);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCommentTypeLabel = (type) => {
    switch (type) {
      case "INITIAL":
        return t('comments.type.initial');
      case "CONFIRMATION":
        return t('comments.type.confirmation');
      case "REJECTION":
        return t('comments.type.rejection');
      case "PROPOSAL":
        return t('comments.type.proposal');
      case "GENERAL":
        return t('comments.type.general');
      default:
        return t('comments.type.general');
    }
  };

  const getCommentTypeColor = (type) => {
    switch (type) {
      case "INITIAL":
        return "#0066cc";
      case "CONFIRMATION":
        return "#00aa00";
      case "REJECTION":
        return "#ff4444";
      case "PROPOSAL":
        return "#ff8800";
      case "GENERAL":
        return "#666666";
      default:
        return "#666666";
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="comments-section">
      <button 
        onClick={onToggle}
        className="comments-toggle"
      >
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="toggle-text">{t('task.comments')}</span>
        {comments.length > 0 && (
          <span className="comments-count">({comments.length})</span>
        )}
      </button>

      {isExpanded && (
        <div className="comments-content">
          {loading ? (
            <div className="comments-loading">{t('loading.comments')}</div>
          ) : (
            <>
              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="no-comments">
                    {t('comments.noComments')}
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span 
                          className="comment-type"
                          style={{ 
                            color: getCommentTypeColor(comment.comment_type),
                            borderColor: getCommentTypeColor(comment.comment_type)
                          }}
                        >
                          {getCommentTypeLabel(comment.comment_type)}
                        </span>
                        <span className="comment-timestamp">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <div className="comment-text">
                        {comment.comment}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitComment} className="comment-form">
                <div className="form-group">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('comments.placeholder')}
                    rows="2"
                    disabled={submitting}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    disabled={submitting || !newComment.trim()}
                    className="btn-primary btn-small"
                  >
                    {submitting ? t('comments.sending') : t('comments.send')}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskCommentsSection;