package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Restaurant struct {
	UUID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"restaurant_uuid"`
	Name        string         `gorm:"type:varchar;not null" json:"name"`
	Info        string         `gorm:"type:text" json:"info"`
	CreatedAt   time.Time      `gorm:"not null" json:"created_at"`
	CreatedAtUTC time.Time     `gorm:"not null" json:"created_at_utc"`
	UpdatedAt   time.Time      `gorm:"not null" json:"updated_at"`
	UpdatedAtUTC time.Time     `gorm:"not null" json:"updated_at_utc"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
