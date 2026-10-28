package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/taskflow/server/internal/models"
)

type CommentHandler struct {
	DB *sql.DB
}

func NewCommentHandler(db *sql.DB) *CommentHandler {
	return &CommentHandler{DB: db}
}

func (h *CommentHandler) GetByTask(c *gin.Context) {
	taskID := c.Param("taskId")

	rows, err := h.DB.Query(
		`SELECT id, task_id, author_id, content, created_at 
		 FROM comments WHERE task_id = $1 
		 ORDER BY created_at ASC`,
		taskID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var cm models.Comment
		if err := rows.Scan(&cm.ID, &cm.TaskID, &cm.AuthorID, &cm.Content, &cm.CreatedAt); err != nil {
			continue
		}
		comments = append(comments, cm)
	}

	if comments == nil {
		comments = []models.Comment{}
	}

	c.JSON(http.StatusOK, comments)
}

func (h *CommentHandler) Create(c *gin.Context) {
	taskID := c.Param("taskId")
	userID := c.GetString("userID")

	var req models.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	commentID := uuid.New().String()

	var cm models.Comment
	err := h.DB.QueryRow(
		`INSERT INTO comments (id, task_id, author_id, content)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, task_id, author_id, content, created_at`,
		commentID, taskID, userID, req.Content,
	).Scan(&cm.ID, &cm.TaskID, &cm.AuthorID, &cm.Content, &cm.CreatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create comment"})
		return
	}

	c.JSON(http.StatusCreated, cm)
}

func (h *CommentHandler) Delete(c *gin.Context) {
	commentID := c.Param("commentId")
	userID := c.GetString("userID")

	// Only author can delete
	var authorID string
	err := h.DB.QueryRow("SELECT author_id FROM comments WHERE id = $1", commentID).Scan(&authorID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Comment not found"})
		return
	}
	if authorID != userID {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Only author can delete comment"})
		return
	}

	h.DB.Exec("DELETE FROM comments WHERE id = $1", commentID)
	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted"})
}
