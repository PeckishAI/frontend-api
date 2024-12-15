package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProcurementStatus string

const (
	ProcurementStatusPending   ProcurementStatus = "pending"
	ProcurementStatusApproved ProcurementStatus = "approved"
	ProcurementStatusRejected ProcurementStatus = "rejected"
	ProcurementStatusReceived ProcurementStatus = "received"
)

type Procurement struct {
	UUID           uuid.UUID         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"procurement_uuid"`
	RestaurantUUID uuid.UUID         `gorm:"type:uuid;not null" json:"restaurant_uuid"`
	SupplierUUID   uuid.UUID         `gorm:"type:uuid;not null" json:"supplier_uuid"`
	Price          float64           `gorm:"type:double precision" json:"price"`
	Currency       string            `gorm:"type:varchar" json:"currency"`
	Status         ProcurementStatus `gorm:"type:varchar;not null" json:"status"`
	Note           string            `gorm:"type:varchar" json:"note"`
	Date           string            `gorm:"type:varchar" json:"date"`
	DeliveryDate   string            `gorm:"type:varchar" json:"delivery_date"`
	ExpectedDate   string            `gorm:"type:varchar" json:"expected_date"`
	CreatedAt      time.Time         `gorm:"not null" json:"created_at"`
	CreatedAtUTC   time.Time         `gorm:"not null" json:"created_at_utc"`
	UpdatedAt      time.Time         `gorm:"not null" json:"updated_at"`
	UpdatedAtUTC   time.Time         `gorm:"not null" json:"updated_at_utc"`
	DeletedAt      gorm.DeletedAt    `gorm:"index" json:"deleted_at,omitempty"`

	Restaurant    Restaurant    `gorm:"foreignKey:RestaurantUUID;references:UUID" json:"restaurant"`
	Supplier      Supplier      `gorm:"foreignKey:SupplierUUID;references:UUID" json:"supplier"`
}

// TableName specifies the table name for the model
func (Procurement) TableName() string {
	return "procurements"
}
