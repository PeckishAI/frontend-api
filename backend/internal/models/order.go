package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusApproved OrderStatus = "approved"
	OrderStatusRejected OrderStatus = "rejected"
	OrderStatusShipped  OrderStatus = "shipped"
	OrderStatusDelivered OrderStatus = "delivered"
)

type Order struct {
	UUID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"order_uuid"`
	RestaurantUUID uuid.UUID     `gorm:"type:uuid;not null" json:"restaurant_uuid"`
	SupplierUUID   uuid.UUID     `gorm:"type:uuid;not null" json:"supplier_uuid"`
	Status         OrderStatus   `gorm:"type:varchar;not null" json:"status"`
	CreatedAt     time.Time     `gorm:"not null" json:"created_at"`
	CreatedAtUTC  time.Time     `gorm:"not null" json:"created_at_utc"`
	UpdatedAt     time.Time     `gorm:"not null" json:"updated_at"`
	UpdatedAtUTC  time.Time     `gorm:"not null" json:"updated_at_utc"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	Restaurant Restaurant `gorm:"foreignKey:RestaurantUUID;references:UUID" json:"restaurant"`
	Supplier   Supplier   `gorm:"foreignKey:SupplierUUID;references:UUID" json:"supplier"`
}

// TableName specifies the table name for the model
func (Order) TableName() string {
	return "orders"
}
