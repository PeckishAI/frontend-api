package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Unit struct {
	UUID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"unit_uuid"`
	Name        string         `gorm:"type:varchar;not null" json:"name"`
	Symbol      string         `gorm:"type:varchar;not null" json:"symbol"`
	Type        string         `gorm:"type:varchar;not null" json:"type"` // weight, volume, quantity, etc.
	BaseUnit    *uuid.UUID     `gorm:"type:uuid" json:"base_unit_uuid"`  // For conversion purposes
	Multiplier  float64        `gorm:"type:double precision" json:"multiplier"`
	Active      bool           `gorm:"not null;default:true" json:"active"`
	CreatedAt   time.Time      `gorm:"not null" json:"created_at"`
	CreatedAtUTC time.Time     `gorm:"not null" json:"created_at_utc"`
	UpdatedAt   time.Time      `gorm:"not null" json:"updated_at"`
	UpdatedAtUTC time.Time     `gorm:"not null" json:"updated_at_utc"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name for the model
func (Unit) TableName() string {
	return "units"
}
