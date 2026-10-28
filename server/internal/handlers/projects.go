package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/taskflow/server/internal/models"
)

type ProjectHandler struct {
	DB *sql.DB
}

func NewProjectHandler(db *sql.DB) *ProjectHandler {
	return &ProjectHandler{DB: db}
}

func (h *ProjectHandler) GetAll(c *gin.Context) {
	userID := c.GetString("userID")

	rows, err := h.DB.Query(
		`SELECT p.id, p.name, p.key, p.description, p.color, p.owner_id, p.created_at, p.updated_at
		 FROM projects p
		 JOIN project_members pm ON pm.project_id = p.id
		 WHERE pm.user_id = $1
		 ORDER BY p.created_at DESC`,
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Key, &p.Description, &p.Color, &p.OwnerID, &p.CreatedAt, &p.UpdatedAt); err != nil {
			continue
		}
		// Get members
		memberRows, _ := h.DB.Query("SELECT user_id FROM project_members WHERE project_id = $1", p.ID)
		if memberRows != nil {
			for memberRows.Next() {
				var memberID string
				memberRows.Scan(&memberID)
				p.Members = append(p.Members, memberID)
			}
			memberRows.Close()
		}
		projects = append(projects, p)
	}

	if projects == nil {
		projects = []models.Project{}
	}

	c.JSON(http.StatusOK, projects)
}

func (h *ProjectHandler) GetByID(c *gin.Context) {
	projectID := c.Param("id")

	var p models.Project
	err := h.DB.QueryRow(
		`SELECT id, name, key, description, color, owner_id, created_at, updated_at 
		 FROM projects WHERE id = $1`,
		projectID,
	).Scan(&p.ID, &p.Name, &p.Key, &p.Description, &p.Color, &p.OwnerID, &p.CreatedAt, &p.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Project not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}

	// Get members
	memberRows, _ := h.DB.Query("SELECT user_id FROM project_members WHERE project_id = $1", p.ID)
	if memberRows != nil {
		for memberRows.Next() {
			var memberID string
			memberRows.Scan(&memberID)
			p.Members = append(p.Members, memberID)
		}
		memberRows.Close()
	}

	c.JSON(http.StatusOK, p)
}

func (h *ProjectHandler) Create(c *gin.Context) {
	var req models.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	userID := c.GetString("userID")
	projectID := uuid.New().String()
	key := strings.ToUpper(req.Key)

	// Check if key is taken
	var count int
	h.DB.QueryRow("SELECT COUNT(*) FROM projects WHERE key = $1", key).Scan(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, models.ErrorResponse{Error: "Project key already exists"})
		return
	}

	var p models.Project
	err := h.DB.QueryRow(
		`INSERT INTO projects (id, name, key, description, owner_id)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, name, key, description, color, owner_id, created_at, updated_at`,
		projectID, req.Name, key, req.Description, userID,
	).Scan(&p.ID, &p.Name, &p.Key, &p.Description, &p.Color, &p.OwnerID, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create project"})
		return
	}

	// Add creator as member
	h.DB.Exec("INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)", projectID, userID)
	p.Members = []string{userID}

	c.JSON(http.StatusCreated, p)
}

func (h *ProjectHandler) Update(c *gin.Context) {
	projectID := c.Param("id")
	userID := c.GetString("userID")

	// Check ownership
	var ownerID string
	err := h.DB.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Project not found"})
		return
	}
	if ownerID != userID {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Only project owner can update"})
		return
	}

	var req models.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	// Build update query
	updates := []string{}
	args := []interface{}{}
	argNum := 1

	if req.Name != nil {
		updates = append(updates, "name = $"+string(rune('0'+argNum)))
		args = append(args, *req.Name)
		argNum++
	}
	if req.Description != nil {
		updates = append(updates, "description = $"+string(rune('0'+argNum)))
		args = append(args, *req.Description)
		argNum++
	}
	if req.Color != nil {
		updates = append(updates, "color = $"+string(rune('0'+argNum)))
		args = append(args, *req.Color)
		argNum++
	}

	if len(updates) > 0 {
		updates = append(updates, "updated_at = NOW()")
		query := "UPDATE projects SET " + strings.Join(updates, ", ") + " WHERE id = $" + string(rune('0'+argNum))
		args = append(args, projectID)
		h.DB.Exec(query, args...)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project updated"})
}

func (h *ProjectHandler) Delete(c *gin.Context) {
	projectID := c.Param("id")
	userID := c.GetString("userID")

	// Check ownership
	var ownerID string
	err := h.DB.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Project not found"})
		return
	}
	if ownerID != userID {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Only project owner can delete"})
		return
	}

	h.DB.Exec("DELETE FROM projects WHERE id = $1", projectID)
	c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}

func (h *ProjectHandler) AddMember(c *gin.Context) {
	projectID := c.Param("id")

	var req models.AddMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	_, err := h.DB.Exec(
		"INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
		projectID, req.UserID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to add member"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member added"})
}

func (h *ProjectHandler) RemoveMember(c *gin.Context) {
	projectID := c.Param("id")
	userID := c.Param("userId")

	h.DB.Exec("DELETE FROM project_members WHERE project_id = $1 AND user_id = $2", projectID, userID)
	c.JSON(http.StatusOK, gin.H{"message": "Member removed"})
}
