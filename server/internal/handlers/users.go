package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/taskflow/server/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB *sql.DB
}

func NewUserHandler(db *sql.DB) *UserHandler {
	return &UserHandler{DB: db}
}

func (h *UserHandler) GetAll(c *gin.Context) {
	rows, err := h.DB.Query(
		`SELECT id, email, name, avatar, role, created_at, updated_at 
		 FROM users ORDER BY created_at DESC`,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Avatar, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}

	if users == nil {
		users = []models.User{}
	}

	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) GetByID(c *gin.Context) {
	userID := c.Param("id")

	var u models.User
	err := h.DB.QueryRow(
		`SELECT id, email, name, avatar, role, created_at, updated_at 
		 FROM users WHERE id = $1`,
		userID,
	).Scan(&u.ID, &u.Email, &u.Name, &u.Avatar, &u.Role, &u.CreatedAt, &u.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "User not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}

	c.JSON(http.StatusOK, u)
}

func (h *UserHandler) Create(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	// Check if email exists
	var count int
	h.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", req.Email).Scan(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, models.ErrorResponse{Error: "Email already registered"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to hash password"})
		return
	}

	var u models.User
	err = h.DB.QueryRow(
		`INSERT INTO users (id, email, password_hash, name, role)
		 VALUES ($1, $2, $3, $4, 'member')
		 RETURNING id, email, name, avatar, role, created_at, updated_at`,
		uuid.New().String(), req.Email, string(hash), req.Name,
	).Scan(&u.ID, &u.Email, &u.Name, &u.Avatar, &u.Role, &u.CreatedAt, &u.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, u)
}

func (h *UserHandler) Delete(c *gin.Context) {
	userID := c.Param("id")
	currentUserID := c.GetString("userID")

	if userID == currentUserID {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Cannot delete yourself"})
		return
	}

	h.DB.Exec("DELETE FROM users WHERE id = $1", userID)
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}
