import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, Plus, Trash2 } from "lucide-react";
import { type Order, type OrderItem } from "@/lib/types";
import { getStatusColor } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { supplierService } from "@/services/supplierService";
import { inventoryService } from "@/services/inventoryService";
import { CreatableSelect } from "@/components/ui/creatable-select";

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  editMode?: boolean;
  onSave?: (order: Order) => void;
}

export default function OrderModal({
  order,
  onClose,
  editMode = false,
  onSave,
}: OrderModalProps) {
  if (!order) return null;

  const [editedOrder, setEditedOrder] = useState<Order>(order);
  const { currentRestaurant } = useRestaurantContext(); // Assuming this context provides necessary data.

  const {
    data: suppliers,
    suppliersLoading,
    error: suppliersError,
  } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("Missing restaurant or supplier UUID");
      }
      return supplierService.getRestaurantSuppliers(
        currentRestaurant?.restaurant_uuid,
      );
    },
    onError: (error) => {
      console.error("Suppliers query error details:", {
        error,
        restaurantId: currentRestaurant?.restaurant_uuid,
        stack: error.stack,
      });
    },
  });

  const { data: ingredients, ingredientsLoading } = useQuery({
    queryKey: ["ingredients", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("Missing restaurant UUID");
      }
      return inventoryService.getRestaurantIngredients(
        currentRestaurant?.restaurant_uuid,
      );
    },
  });

  const getIngredientOptions = (supplier_uuid: string) => {
    if (!ingredients) return [];

    const ingredientsArray = Object.values(ingredients);
    const categories = {
      Connected: ingredientsArray
        .filter((ing) =>
          ing.ingredient_suppliers?.some(
            (s) => s.supplier?.supplier_uuid === supplier_uuid,
          ),
        )
        .map((ing) => ({
          label: ing.ingredient_name,
          value: ing.ingredient_uuid,
          category: "Connected",
          unit: ing.ingredient_suppliers?.find(
            (s) => s.supplier?.supplier_uuid === supplier_uuid,
          )?.unit?.unit_name,
          price: ing.ingredient_suppliers?.find(
            (s) => s.supplier?.supplier_uuid === supplier_uuid,
          )?.unit_cost,
        })),
      Other: ingredientsArray
        .filter(
          (ing) =>
            !ing.ingredient_suppliers?.some(
              (s) => s.supplier?.supplier_uuid === supplier_uuid,
            ),
        )
        .map((ing) => ({
          label: ing.ingredient_name,
          value: ing.ingredient_uuid,
          category: "Other",
          unit: "none",
          price: 0,
        })),
    };

    return [...categories.Connected, ...categories.Other];
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedOrder);
    }
    onClose();
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...editedOrder.items];
    newItems[index] = { ...newItems[index], [field]: value };
    console.log("Updated item:", newItems);

    // Recalculate item total
    if (field === "quantity" || field === "price") {
      const quantity = field === "quantity" ? value : newItems[index].quantity;
      const price = field === "price" ? value : newItems[index].price;
      newItems[index].total = quantity * price;
    }

    // Update order total
    const newTotal = newItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    setEditedOrder({
      ...editedOrder,
      items: newItems,
      total: newTotal,
    });
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: `new-${Date.now()}`,
      name: "",
      quantity: 0,
      unit: "",
      price: 0,
      total: 0,
    };
    setEditedOrder({
      ...editedOrder,
      items: [...editedOrder.items, newItem],
    });
  };

  const removeItem = (index: number) => {
    const newItems = editedOrder.items.filter((_, i) => i !== index);
    const newTotal = newItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    setEditedOrder({
      ...editedOrder,
      items: newItems,
      total: newTotal,
    });
  };

  const isDraft = editedOrder.status === "draft";

  const renderNonDraftLayout = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Supplier</label>
          <div className="font-medium">{editedOrder.supplier_name}</div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Date</label>
          <div className="font-medium">
            {new Date(editedOrder.orderDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editedOrder.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell className="text-right">
                ${item.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ${(item.quantity * item.price).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4} className="text-right font-semibold">
              Total
            </TableCell>
            <TableCell className="text-right font-semibold">
              ${editedOrder.total.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Sheet open={!!order} onOpenChange={() => onClose()}>
      <SheetContent className="w-[800px] sm:max-w-[800px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <Badge className={getStatusColor(editedOrder.status)}>
              {editedOrder.status.charAt(0).toUpperCase() +
                editedOrder.status.slice(1)}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {isDraft ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Supplier</label>
                {suppliersLoading ? (
                  <p>Loading suppliers...</p>
                ) : (
                  <CreatableSelect
                    options={suppliers?.map((supplier) => ({
                      label: supplier.supplier_name,
                      value: supplier.supplier_uuid,
                    }))}
                    size="large"
                    value={[editedOrder.supplier_uuid]}
                    onChange={(values) => {
                      if (values && values.length > 0) {
                        const selectedSupplier = suppliers?.find(
                          (s) => s.supplier_uuid === values[0],
                        );
                        setEditedOrder({
                          ...editedOrder,
                          supplier_uuid: values[0],
                          supplier_name: selectedSupplier?.supplier_name || "",
                        });
                      }
                    }}
                    disabled={!editMode}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Date</label>
                <Input
                  type="date"
                  value={
                    new Date(editedOrder.orderDate).toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setEditedOrder({
                      ...editedOrder,
                      orderDate: e.target.value,
                    })
                  }
                  disabled={!editMode}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {editMode && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedOrder.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <CreatableSelect
                        value={
                          item.ingredient_uuid ? [item.ingredient_uuid] : []
                        }
                        size="medium"
                        onChange={(values) => {
                          try {
                            const newItems = [...editedOrder.items];
                            const selectedId = values?.[0] || "";
                            const selectedOption = selectedId
                              ? getIngredientOptions(
                                  editedOrder.supplier_uuid,
                                ).find((opt) => opt.value === selectedId)
                              : null;

                            newItems[index] = {
                              ...newItems[index],
                              ingredient_uuid: selectedId,
                              name: selectedOption
                                ? selectedOption.label
                                : selectedId,
                              price: selectedOption?.price || 0,
                              unit: selectedOption?.unit || "none",
                              total:
                                (selectedOption?.price || 0) *
                                newItems[index].quantity,
                            };

                            const newTotal = newItems.reduce(
                              (sum, item) => sum + item.quantity * item.price,
                              0,
                            );

                            setEditedOrder((prev) => ({
                              ...prev,
                              items: newItems,
                              total: newTotal,
                            }));
                          } catch (error) {
                            console.error(
                              "Error in ingredient selection:",
                              error,
                            );
                          }
                        }}
                        options={getIngredientOptions(
                          editedOrder.supplier_uuid,
                        )}
                        placeholder="Item"
                        disabled={!editMode}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseFloat(e.target.value),
                          )
                        }
                        disabled={!editMode}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(index, "unit", e.target.value)
                        }
                        disabled={!editMode}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", parseFloat(e.target.value))
                        }
                        disabled={!editMode}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ${(item.quantity * item.price).toFixed(2)}
                    </TableCell>
                    {editMode && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${editedOrder.total.toFixed(2)}
                  </TableCell>
                  {editMode && <TableCell />}
                </TableRow>
              </TableBody>
            </Table>

            {editMode && (
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        ) : (
          renderNonDraftLayout()
        )}
      </SheetContent>
    </Sheet>
  );
}
