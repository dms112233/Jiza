package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/taskflow/server/internal/models"
)

type TaskHandler struct {
	DB *sql.DB
}

func NewTaskHandler(db *sql.DB) *TaskHandler {
	return &TaskHandler{DB: db}
}

func (h *TaskHandler) GetByProject(c *gin.Context) {
	projectID := c.Param("projectId")

	rows, err := h.DB.Query(
		`SELECT id, project_id, title, description, status, priority, type, 
		 assignee_id, reporter_id, story_points, labels, position_order, created_at, updated_at
		 FROM tasks WHERE project_id = $1
		 ORDER BY position_order ASC`,
		projectID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var t models.Task
		if err := rows.Scan(
			&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.Status, &t.Priority,
			&t.Type, &t.AssigneeID, &t.ReporterID, &t.StoryPoints, pq.Array(&t.Labels),
			&t.Order, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			continue
		}
		tasks = append(tasks, t)
	}

	if tasks == nil {
		tasks = []models.Task{}
	}

	c.JSON(http.StatusOK, tasks)
}

func (h *TaskHandler) GetByID(c *gin.Context) {
	taskID := c.Param("id")

	var t models.Task
	err := h.DB.QueryRow(
		`SELECT id, project_id, title, description, status, priority, type,
		 assignee_id, reporter_id, story_points, labels, position_order, created_at, updated_at
		 FROM tasks WHERE id = $1`,
		taskID,
	).Scan(
		&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.Status, &t.Priority,
		&t.Type, &t.AssigneeID, &t.ReporterID, &t.StoryPoints, pq.Array(&t.Labels),
		&t.Order, &t.CreatedAt, &t.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Task not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}

	c.JSON(http.StatusOK, t)
}

func (h *TaskHandler) Create(c *gin.Context) {
	var req models.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	userID := c.GetString("userID")
	taskID := uuid.New().String()

	taskType := req.Type
	if taskType == "" {
		taskType = "task"
	}
	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}

	// Get max order for backlog
	var maxOrder int
	h.DB.QueryRow(
		"SELECT COALESCE(MAX(position_order), -1) FROM tasks WHERE project_id = $1 AND status = 'backlog'",
		req.ProjectID,
	).Scan(&maxOrder)

	var t models.Task
	err := h.DB.QueryRow(
		`INSERT INTO tasks (id, project_id, title, description, type, priority, reporter_id, position_order)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, project_id, title, description, status, priority, type,
		 assignee_id, reporter_id, story_points, labels, position_order, created_at, updated_at`,
		taskID, req.ProjectID, req.Title, req.Description, taskType, priority, userID, maxOrder+1,
	).Scan(
		&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.Status, &t.Priority,
		&t.Type, &t.AssigneeID, &t.ReporterID, &t.StoryPoints, pq.Array(&t.Labels),
		&t.Order, &t.CreatedAt, &t.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create task: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, t)
}

func (h *TaskHandler) Update(c *gin.Context) {
	taskID := c.Param("id")

	var req models.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	// Build dynamic update
	sets := []string{}
	args := []interface{}{}
	argNum := 1

	if req.Title != nil {
		sets = append(sets, "title = $"+itoa(argNum))
		args = append(args, *req.Title)
		argNum++
	}
	if req.Description != nil {
		sets = append(sets, "description = $"+itoa(argNum))
		args = append(args, *req.Description)
		argNum++
	}
	if req.Status != nil {
		sets = append(sets, "status = $"+itoa(argNum))
		args = append(args, *req.Status)
		argNum++
	}
	if req.Priority != nil {
		sets = append(sets, "priority = $"+itoa(argNum))
		args = append(args, *req.Priority)
		argNum++
	}
	if req.Type != nil {
		sets = append(sets, "type = $"+itoa(argNum))
		args = append(args, *req.Type)
		argNum++
	}
	if req.AssigneeID != nil {
		if *req.AssigneeID == "" {
			sets = append(sets, "assignee_id = NULL")
		} else {
			sets = append(sets, "assignee_id = $"+itoa(argNum))
			args = append(args, *req.AssigneeID)
			argNum++
		}
	}
	if req.StoryPoints != nil {
		sets = append(sets, "story_points = $"+itoa(argNum))
		args = append(args, *req.StoryPoints)
		argNum++
	}
	if req.Labels != nil {
		sets = append(sets, "labels = $"+itoa(argNum))
		args = append(args, pq.Array(req.Labels))
		argNum++
	}

	if len(sets) == 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "No fields to update"})
		return
	}

	sets = append(sets, "updated_at = NOW()")
	args = append(args, taskID)

	query := "UPDATE tasks SET " + joinStrings(sets, ", ") + " WHERE id = $" + itoa(argNum)
	_, err := h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update task"})
		return
	}

	// Return updated task
	var t models.Task
	h.DB.QueryRow(
		`SELECT id, project_id, title, description, status, priority, type,
		 assignee_id, reporter_id, story_points, labels, position_order, created_at, updated_at
		 FROM tasks WHERE id = $1`,
		taskID,
	).Scan(
		&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.Status, &t.Priority,
		&t.Type, &t.AssigneeID, &t.ReporterID, &t.StoryPoints, pq.Array(&t.Labels),
		&t.Order, &t.CreatedAt, &t.UpdatedAt,
	)

	c.JSON(http.StatusOK, t)
}

func (h *TaskHandler) Move(c *gin.Context) {
	taskID := c.Param("id")

	var req models.MoveTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	// Get max order for target column
	var maxOrder int
	h.DB.QueryRow(
		"SELECT COALESCE(MAX(position_order), -1) FROM tasks WHERE project_id = (SELECT project_id FROM tasks WHERE id = $1) AND status = $2",
		taskID, req.Status,
	).Scan(&maxOrder)

	order := req.Order
	if order == 0 {
		order = maxOrder + 1
	}

	_, err := h.DB.Exec(
		"UPDATE tasks SET status = $1, position_order = $2, updated_at = NOW() WHERE id = $3",
		req.Status, order, taskID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to move task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task moved"})
}

func (h *TaskHandler) Delete(c *gin.Context) {
	taskID := c.Param("id")

	result, err := h.DB.Exec("DELETE FROM tasks WHERE id = $1", taskID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete task"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Task not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted"})
}

// Helper functions
func itoa(i int) string {
	return string(rune('0' + i))
}

func joinStrings(strs []string, sep string) string {
	result := ""
	for i, s := range strs {
		if i > 0 {
			result += sep
		}
		result += s
	}
	return result
}
