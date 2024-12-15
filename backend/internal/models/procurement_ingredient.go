package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProcurementIngredient struct {
	UUID            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"uuid"`
	ProcurementUUID uuid.UUID     `gorm:"type:uuid;not null" json:"procurement_uuid"`
	IngredientUUID  uuid.UUID     `gorm:"type:uuid;not null" json:"ingredient_uuid"`
	UnitUUID        uuid.UUID     `gorm:"type:uuid;not null" json:"unit_uuid"`
	Quantity        float64       `gorm:"type:double precision;not null" json:"quantity"`
	UnitCost        float64       `gorm:"type:double precision;not null" json:"unit_cost"`
	Currency        string        `gorm:"type:varchar" json:"currency"`
	IsAvailable     bool          `gorm:"not null;default:true" json:"is_available"`
	CreatedAt       time.Time     `gorm:"not null" json:"created_at"`
	CreatedAtUTC    time.Time     `gorm:"not null" json:"created_at_utc"`
	UpdatedAt       time.Time     `gorm:"not null" json:"updated_at"`
	UpdatedAtUTC    time.Time     `gorm:"not null" json:"updated_at_utc"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Procurement Procurement `gorm:"foreignKey:ProcurementUUID;references:UUID" json:"procurement"`
	Ingredient  Ingredient  `gorm:"foreignKey:IngredientUUID;references:UUID" json:"ingredient"`
	Unit        Unit        `gorm:"foreignKey:UnitUUID;references:UUID" json:"unit"`
}

// TableName specifies the table name for the model
func (ProcurementIngredient) TableName() string {
	return "procurement_ingredients"
}
