package models

import "time"

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	Avatar       string    `json:"avatar"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Project struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Key         string    `json:"key"`
	Description string    `json:"description"`
	Color       string    `json:"color"`
	OwnerID     string    `json:"ownerId"`
	Members     []string  `json:"members"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Task struct {
	ID           string     `json:"id"`
	ProjectID    string     `json:"projectId"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	Status       string     `json:"status"`
	Priority     string     `json:"priority"`
	Type         string     `json:"type"`
	AssigneeID   *string    `json:"assigneeId"`
	ReporterID   string     `json:"reporterId"`
	Deadline     *time.Time `json:"deadline"`
	StartDate    *time.Time `json:"startDate"`
	Labels       []string   `json:"labels"`
	Order        int        `json:"order"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

type Comment struct {
	ID        string    `json:"id"`
	TaskID    string    `json:"taskId"`
	AuthorID  string    `json:"authorId"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

// Request/Response types

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required,min=2"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateProjectRequest struct {
	Name        string `json:"name" binding:"required,min=2"`
	Key         string `json:"key" binding:"required,min=2,max=5"`
	Description string `json:"description"`
}

type UpdateProjectRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Color       *string `json:"color"`
}

type CreateTaskRequest struct {
	ProjectID   string     `json:"projectId" binding:"required"`
	Title       string     `json:"title" binding:"required,min=1"`
	Type        string     `json:"type" binding:"omitempty,oneof=story bug task epic"`
	Priority    string     `json:"priority" binding:"omitempty,oneof=lowest low medium high highest"`
	Status      string     `json:"status" binding:"omitempty,oneof=backlog todo in_progress review done"`
	Description string     `json:"description"`
	Deadline    *time.Time `json:"deadline"`
	StartDate   *time.Time `json:"startDate"`
	AssigneeID  *string    `json:"assigneeId"`
	Labels      []string   `json:"labels"`
}

type UpdateTaskRequest struct {
	Title       *string    `json:"title"`
	Description *string    `json:"description"`
	Status      *string    `json:"status" binding:"omitempty,oneof=backlog todo in_progress review done"`
	Priority    *string    `json:"priority" binding:"omitempty,oneof=lowest low medium high highest"`
	Type        *string    `json:"type" binding:"omitempty,oneof=story bug task epic"`
	AssigneeID  *string    `json:"assigneeId"`
	Deadline    *time.Time `json:"deadline"`
	StartDate   *time.Time `json:"startDate"`
	Labels      []string   `json:"labels"`
}

type MoveTaskRequest struct {
	Status string `json:"status" binding:"required,oneof=backlog todo in_progress review done"`
	Order  int    `json:"order"`
}

type CreateCommentRequest struct {
	Content string `json:"content" binding:"required,min=1"`
}

type AddMemberRequest struct {
	UserID string `json:"userId" binding:"required"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
