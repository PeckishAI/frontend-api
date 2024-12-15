package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/restaurant-supplier/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() error {
	log.Printf("Initializing database connection")
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Printf("DATABASE_URL not found, constructing from individual variables")
		host := os.Getenv("PGHOST")
		user := os.Getenv("PGUSER")
		password := os.Getenv("PGPASSWORD")
		dbname := os.Getenv("PGDATABASE")
		port := os.Getenv("PGPORT")
		
		if host == "" || user == "" || password == "" || dbname == "" || port == "" {
			return fmt.Errorf("missing required database environment variables")
		}
		
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			host, user, password, dbname, port)
	}
	log.Printf("Database connection string configured successfully")

	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %v", err)
	}

	// Test the connection
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}
	log.Printf("Successfully connected to database")

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto migrate the schema with detailed logging
	log.Printf("Starting database migration...")
	for _, model := range []interface{}{
		&models.Supplier{},
		&models.Order{},
		&models.OrderItem{},
		&models.Ingredient{},
		&models.IngredientSupplier{},
	} {
		log.Printf("Migrating model: %T", model)
		if err := db.AutoMigrate(model); err != nil {
			return fmt.Errorf("failed to migrate %T: %v", model, err)
		}
		log.Printf("Successfully migrated %T", model)
	}
	log.Printf("Database migration completed successfully")

	DB = db
	log.Println("Connected to database successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
