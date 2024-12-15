package models

import "time"

type Supplier struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	Category    string    `json:"category" gorm:"not null"`
	Email       *string   `json:"email"`
	Phone       *string   `json:"phone"`
	Address     *string   `json:"address"`
	Notes       *string   `json:"notes"`
	Active      bool      `json:"active" gorm:"not null;default:true"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Order struct {
	ID           uint        `json:"id" gorm:"primaryKey"`
	RestaurantID uint        `json:"restaurantId" gorm:"not null"`
	SupplierID   uint        `json:"supplierId" gorm:"not null"`
	Status       string      `json:"status" gorm:"not null"`
	CreatedAt    time.Time   `json:"createdAt"`
	UpdatedAt    time.Time   `json:"updatedAt"`
	Supplier     Supplier    `json:"supplier" gorm:"foreignKey:SupplierID"`
	Items        []OrderItem `json:"items"`
}

type OrderItem struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	OrderID   uint      `json:"orderId" gorm:"not null"`
	Name      string    `json:"name" gorm:"not null"`
	Quantity  float64   `json:"quantity" gorm:"not null"`
	Unit      string    `json:"unit" gorm:"not null"`
	Price     float64   `json:"price" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Ingredient struct {
	ID                  uint                `json:"id" gorm:"primaryKey"`
	Name                string              `json:"name" gorm:"not null"`
	Description         *string             `json:"description"`
	Tags                []string            `json:"tags" gorm:"type:text[]"`
	ParLevel            float64             `json:"parLevel" gorm:"not null"`
	Quantity            float64             `json:"quantity" gorm:"not null"`
	Unit                string              `json:"unit" gorm:"not null"`
	Active              bool                `json:"active" gorm:"not null;default:true"`
	CreatedAt           time.Time           `json:"createdAt"`
	UpdatedAt           time.Time           `json:"updatedAt"`
	IngredientSuppliers []IngredientSupplier `json:"ingredientSuppliers" gorm:"foreignKey:IngredientID"`
}

type IngredientSupplier struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	IngredientID uint     `json:"ingredientId" gorm:"not null"`
	SupplierID  uint      `json:"supplierId" gorm:"not null"`
	UnitCost    float64   `json:"unitCost" gorm:"not null"`
	PackSize    string    `json:"packSize" gorm:"not null"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Supplier    Supplier  `json:"supplier" gorm:"foreignKey:SupplierID"`
}
