package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderItem struct {
	UUID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"uuid"`
	OrderUUID     uuid.UUID     `gorm:"type:uuid;not null" json:"order_uuid"`
	IngredientUUID uuid.UUID     `gorm:"type:uuid;not null" json:"ingredient_uuid"`
	UnitUUID      uuid.UUID     `gorm:"type:uuid;not null" json:"unit_uuid"`
	Quantity      float64       `gorm:"type:double precision;not null" json:"quantity"`
	UnitCost      float64       `gorm:"type:double precision;not null" json:"unit_cost"`
	Currency      string        `gorm:"type:varchar" json:"currency"`
	Status        string        `gorm:"type:varchar;not null" json:"status"`
	CreatedAt     time.Time     `gorm:"not null" json:"created_at"`
	CreatedAtUTC  time.Time     `gorm:"not null" json:"created_at_utc"`
	UpdatedAt     time.Time     `gorm:"not null" json:"updated_at"`
	UpdatedAtUTC  time.Time     `gorm:"not null" json:"updated_at_utc"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Order      Order      `gorm:"foreignKey:OrderUUID;references:UUID" json:"order"`
	Ingredient Ingredient `gorm:"foreignKey:IngredientUUID;references:UUID" json:"ingredient"`
	Unit       Unit       `gorm:"foreignKey:UnitUUID;references:UUID" json:"unit"`
}

// TableName specifies the table name for the model
func (OrderItem) TableName() string {
	return "order_items"
}
