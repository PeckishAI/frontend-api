package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Ingredient struct {
	UUID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"ingredient_uuid"`
	Name        string         `gorm:"type:varchar;not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Info        string         `gorm:"type:text" json:"info"`
	Category    string         `gorm:"type:varchar" json:"category"`
	Active      bool           `gorm:"not null;default:true" json:"active"`
	CreatedAt   time.Time      `gorm:"not null" json:"created_at"`
	CreatedAtUTC time.Time     `gorm:"not null" json:"created_at_utc"`
	UpdatedAt   time.Time      `gorm:"not null" json:"updated_at"`
	UpdatedAtUTC time.Time     `gorm:"not null" json:"updated_at_utc"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name for the model
func (Ingredient) TableName() string {
	return "ingredients"
}
