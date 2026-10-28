package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/taskflow/server/internal/handlers"
	"github.com/taskflow/server/internal/middleware"
)

func Setup(db *sql.DB, jwtSecret string) *gin.Engine {
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, jwtSecret)
	projectHandler := handlers.NewProjectHandler(db)
	taskHandler := handlers.NewTaskHandler(db)
	userHandler := handlers.NewUserHandler(db)
	commentHandler := handlers.NewCommentHandler(db)

	// Public routes
	api := r.Group("/api")
	{
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// Auth
		protected.GET("/auth/me", authHandler.Me)

		// Projects
		protected.GET("/projects", projectHandler.GetAll)
		protected.GET("/projects/:id", projectHandler.GetByID)
		protected.POST("/projects", projectHandler.Create)
		protected.PUT("/projects/:id", projectHandler.Update)
		protected.DELETE("/projects/:id", projectHandler.Delete)
		protected.POST("/projects/:id/members", projectHandler.AddMember)
		protected.DELETE("/projects/:id/members/:userId", projectHandler.RemoveMember)

		// Tasks
		protected.GET("/projects/:projectId/tasks", taskHandler.GetByProject)
		protected.GET("/tasks/:id", taskHandler.GetByID)
		protected.POST("/tasks", taskHandler.Create)
		protected.PUT("/tasks/:id", taskHandler.Update)
		protected.PUT("/tasks/:id/move", taskHandler.Move)
		protected.DELETE("/tasks/:id", taskHandler.Delete)

		// Comments
		protected.GET("/tasks/:taskId/comments", commentHandler.GetByTask)
		protected.POST("/tasks/:taskId/comments", commentHandler.Create)
		protected.DELETE("/comments/:commentId", commentHandler.Delete)

		// Users
		protected.GET("/users", userHandler.GetAll)
		protected.GET("/users/:id", userHandler.GetByID)
		protected.POST("/users", middleware.AdminMiddleware(), userHandler.Create)
		protected.DELETE("/users/:id", middleware.AdminMiddleware(), userHandler.Delete)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "taskflow"})
	})

	return r
}
