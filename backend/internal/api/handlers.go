package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurant-supplier/internal/database"
	"github.com/restaurant-supplier/internal/models"
)

// GetInventory returns all ingredients with their supplier information
func GetInventory(c *gin.Context) {
	var ingredients []models.Ingredient
	result := database.GetDB().Find(&ingredients)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	// For each ingredient, get its suppliers
	type IngredientResponse struct {
		models.Ingredient
		Suppliers []struct {
			SupplierID   uint    `json:"supplierId"`
			SupplierName string  `json:"supplierName"`
			UnitCost     float64 `json:"unitCost"`
			PackSize     string  `json:"packSize"`
		} `json:"suppliers"`
	}

	var response []IngredientResponse
	for _, ingredient := range ingredients {
		var supplierInfo []struct {
			SupplierID   uint    `json:"supplierId"`
			SupplierName string  `json:"supplierName"`
			UnitCost     float64 `json:"unitCost"`
			PackSize     string  `json:"packSize"`
		}

		database.GetDB().Table("ingredient_suppliers").
			Select("ingredient_suppliers.supplier_id, suppliers.name as supplier_name, ingredient_suppliers.unit_cost, ingredient_suppliers.pack_size").
			Joins("LEFT JOIN suppliers ON suppliers.id = ingredient_suppliers.supplier_id").
			Where("ingredient_suppliers.ingredient_id = ?", ingredient.ID).
			Scan(&supplierInfo)

		response = append(response, IngredientResponse{
			Ingredient: ingredient,
			Suppliers: supplierInfo,
		})
	}

	c.JSON(http.StatusOK, response)
}

// CreateIngredient creates a new ingredient
func CreateIngredient(c *gin.Context) {
	type IngredientInput struct {
		Name        string    `json:"name" binding:"required"`
		Description string    `json:"description"`
		Tags        []string  `json:"tags" binding:"required"`
		ParLevel    float64   `json:"parLevel" binding:"required"`
		Quantity    float64   `json:"quantity" binding:"required"`
		Unit        string    `json:"unit" binding:"required"`
		Suppliers   []struct {
			SupplierID uint    `json:"supplierId"`
			UnitCost   float64 `json:"unitCost"`
			PackSize   string  `json:"packSize"`
		} `json:"suppliers"`
	}

	var input IngredientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Start a transaction
	tx := database.GetDB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Create ingredient
	ingredient := models.Ingredient{
		Name:        input.Name,
		Description: &input.Description,
		Tags:        input.Tags,
		ParLevel:    input.ParLevel,
		Quantity:    input.Quantity,
		Unit:        input.Unit,
		Active:      true,
	}

	if err := tx.Create(&ingredient).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ingredient"})
		return
	}

	// Create supplier associations
	for _, supplier := range input.Suppliers {
		ingredientSupplier := models.IngredientSupplier{
			IngredientID: ingredient.ID,
			SupplierID:   supplier.SupplierID,
			UnitCost:     supplier.UnitCost,
			PackSize:     supplier.PackSize,
		}

		if err := tx.Create(&ingredientSupplier).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ingredient supplier association"})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, ingredient)
}

// GetSuppliers returns all suppliers
func GetSuppliers(c *gin.Context) {
	var suppliers []models.Supplier
	result := database.GetDB().Find(&suppliers)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch suppliers"})
		return
	}
	c.JSON(http.StatusOK, suppliers)
}

// CreateSupplier creates a new supplier
func CreateSupplier(c *gin.Context) {
	var supplier models.Supplier
	if err := c.ShouldBindJSON(&supplier); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := database.GetDB().Create(&supplier)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create supplier"})
		return
	}

	c.JSON(http.StatusCreated, supplier)
}

// GetOrders returns all orders with their items and supplier information
func GetOrders(c *gin.Context) {
	var orders []models.Order
	result := database.GetDB().
		Preload("Items").
		Preload("Supplier").
		Find(&orders)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Transform orders for frontend
	type OrderResponse struct {
		ID           string                `json:"id"`
		SupplierName string                `json:"supplierName"`
		OrderDate    string                `json:"orderDate"`
		Status       string                `json:"status"`
		Items        []models.OrderItem    `json:"items"`
		Total        float64               `json:"total"`
	}

	var response []OrderResponse
	for _, order := range orders {
		var total float64
		for _, item := range order.Items {
			total += item.Price * item.Quantity
		}

		response = append(response, OrderResponse{
			ID:           strconv.FormatUint(uint64(order.ID), 10),
			SupplierName: order.Supplier.Name,
			OrderDate:    order.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			Status:       order.Status,
			Items:        order.Items,
			Total:        total,
		})
	}

	c.JSON(http.StatusOK, response)
}

// CreateOrder creates a new order with items
func CreateOrder(c *gin.Context) {
	type OrderInput struct {
		SupplierID uint                  `json:"supplierId" binding:"required"`
		Status     string                `json:"status" binding:"required"`
		Items      []models.OrderItem    `json:"items" binding:"required"`
	}

	var input OrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Start a transaction
	tx := database.GetDB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Create order
	order := models.Order{
		SupplierID: input.SupplierID,
		Status:     input.Status,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Add items to order
	for i := range input.Items {
		input.Items[i].OrderID = order.ID
	}

	if err := tx.CreateInBatch(&input.Items, len(input.Items)).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order items"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// Return the created order with items
	var createdOrder models.Order
	if err := database.GetDB().Preload("Items").Preload("Supplier").First(&createdOrder, order.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch created order"})
		return
	}

	c.JSON(http.StatusCreated, createdOrder)
}
