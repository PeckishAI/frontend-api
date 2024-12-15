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
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

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

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto migrate the schema
	err = db.AutoMigrate(
		&models.Supplier{},
		&models.Order{},
		&models.OrderItem{},
		&models.Ingredient{},
		&models.IngredientSupplier{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %v", err)
	}

	DB = db
	log.Println("Connected to database successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
