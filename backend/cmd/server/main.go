package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/restaurant-supplier/internal/api"
	"github.com/restaurant-supplier/internal/database"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize router with logger and recovery middleware
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
	})

	// Add a test endpoint to verify the server is running
	r.GET("/health", func(c *gin.Context) {
		log.Printf("Health check endpoint called")
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"message": "Go backend is running",
		})
	})

	// Serve static files for the frontend
	r.Static("/assets", "./dist/public/assets")
	r.StaticFile("/", "./dist/public/index.html")
	r.NoRoute(func(c *gin.Context) {
		c.File("./dist/public/index.html")
	})

	// API routes
	apiGroup := r.Group("/api")
	{
		// Test endpoint
		apiGroup.GET("/test", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "API is working",
			})
		})

		// Suppliers
		apiGroup.GET("/suppliers", api.GetSuppliers)
		apiGroup.POST("/suppliers", api.CreateSupplier)

		// Orders
		apiGroup.GET("/orders", api.GetOrders)
		apiGroup.POST("/orders", api.CreateOrder)

		// Inventory
		apiGroup.GET("/inventory", api.GetInventory)
		apiGroup.POST("/inventory", api.CreateIngredient)
	}

	// Print all registered routes
	for _, route := range r.Routes() {
		log.Printf("Registered route: %s %s", route.Method, route.Path)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// Use port from environment variable with fallback to 3001
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
