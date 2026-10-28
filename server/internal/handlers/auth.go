package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/taskflow/server/internal/middleware"
	"github.com/taskflow/server/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB     *sql.DB
	Secret string
}

func NewAuthHandler(db *sql.DB, secret string) *AuthHandler {
	return &AuthHandler{DB: db, Secret: secret}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	// Check if user exists
	var count int
	err := h.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", req.Email).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, models.ErrorResponse{Error: "User with this email already exists"})
		return
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to hash password"})
		return
	}

	// Create user
	var user models.User
	err = h.DB.QueryRow(
		`INSERT INTO users (id, email, password_hash, name, role) 
		 VALUES ($1, $2, $3, $4, 'member')
		 RETURNING id, email, name, avatar, role, created_at, updated_at`,
		uuid.New().String(), req.Email, string(hash), req.Name,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Avatar, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create user"})
		return
	}

	// Generate token
	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role, h.Secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{Token: token, User: user})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	var user models.User
	var passwordHash string
	err := h.DB.QueryRow(
		`SELECT id, email, password_hash, name, avatar, role, created_at, updated_at 
		 FROM users WHERE email = $1`,
		req.Email,
	).Scan(&user.ID, &user.Email, &passwordHash, &user.Name, &user.Avatar, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid email or password"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database error"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid email or password"})
		return
	}

	// Generate token
	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role, h.Secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{Token: token, User: user})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetString("userID")

	var user models.User
	err := h.DB.QueryRow(
		`SELECT id, email, name, avatar, role, created_at, updated_at 
		 FROM users WHERE id = $1`,
		userID,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Avatar, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
