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
import {
  type Order,
  type OrderItem,
  type Supplier,
  type Unit,
} from "@/lib/OrderTypes";
import { getStatusColor } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { supplierService } from "@/services/supplierService";
import { inventoryService } from "@/services/inventoryService";
import { CreatableSelect } from "@/components/ui/creatable-select";

const defaultUnits = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'l', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (mL)' },
  { value: 'pcs', label: 'Pieces' },
  { value: 'box', label: 'Box' },
  { value: 'case', label: 'Case' },
  { value: 'bag', label: 'Bag' }
];


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
  console.log("editedOrder", editedOrder);
  const { currentRestaurant } = useRestaurantContext();

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("Missing restaurant or supplier UUID");
      }
      return supplierService.getRestaurantSuppliers(
        currentRestaurant?.restaurant_uuid,
      );
    },
  });

  const { data: ingredients } = useQuery({
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
    console.log("Ingredient Array : ", ingredientsArray);
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
    if (!editedOrder.items) {
      return;
    }
    const newItems = [...editedOrder.items];
    newItems[index] = { ...newItems[index], [field]: value };
    console.log("Updated item:", newItems);

    if (field === "quantity" || field === "unit_cost") {
      const quantity = field === "quantity" ? value : newItems[index].quantity;
      const unit_cost =
        field === "unit_cost" ? value : newItems[index].unit_cost;
      newItems[index].total_cost = quantity * unit_cost;
    }

    // Update order total
    const newTotal = newItems.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unit_cost || 0),
      0,
    );

    setEditedOrder({
      ...editedOrder,
      items: newItems,
      amount: newTotal,
    });
  };

  const addItem = () => {
    const newItem: OrderItem = {};
    if (!editedOrder.items) {
      return;
    }
    setEditedOrder({
      ...editedOrder,
      items: [...editedOrder.items, newItem],
    });
  };

  const removeItem = (index: number) => {
    if (!editedOrder.items) {
      return;
    }
    const newItems = editedOrder.items.filter((_, i) => i !== index);
    const newTotal = newItems.reduce(
      (sum, item) => sum + (item.quantity || 9) * (item.unit_cost || 0),
      0,
    );
    setEditedOrder({
      ...editedOrder,
      items: newItems,
      amount: newTotal,
    });
  };

  const isDraft = editedOrder.status === "draft";

  const renderNonDraftLayout = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Supplier</label>
          <div className="font-medium">
            {editedOrder.supplier?.supplier_name}
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Date</label>
          <div className="font-medium">
            {new Date(editedOrder.delivery_date || "").toLocaleDateString()}
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
          {editedOrder.items ? (
            <>
              {editedOrder.items.map((item) => (
                <TableRow key={item.ingredient_uuid}>
                  <TableCell>{item.ingredient_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit?.unit_name}</TableCell>
                  <TableCell className="text-right">
                    {item.unit_cost ? item.unit_cost.toFixed(2) : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {((item.quantity ?? 0) * (item.unit_cost ?? 0)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ${editedOrder.amount ? editedOrder.amount.toFixed(2) : "N/A"}
                </TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No items available
              </TableCell>
            </TableRow>
          )}
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
            <Badge className={getStatusColor(editedOrder.status || "")}>
              {editedOrder.status
                ? editedOrder.status.charAt(0).toUpperCase() +
                  editedOrder.status.slice(1)
                : ""}
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
                    options={suppliers?.map((supplier: Supplier) => ({
                      label: supplier.supplier_name,
                      value: supplier.supplier_uuid,
                    }))}
                    placeholder=""
                    size="large"
                    value={suppliers
                      ?.filter(
                        (s: Supplier) =>
                          s.supplier_uuid ===
                          editedOrder.supplier?.supplier_uuid,
                      )
                      .map((s: Supplier) => ({
                        label: s.supplier_name,
                        value: s.supplier_uuid,
                      }))}
                    onChange={(option) => {
                      if (option) {
                        const selectedSupplier = suppliers?.find(
                          (s: Supplier) => s.supplier_uuid === option.value,
                        );
                        setEditedOrder({
                          ...editedOrder,
                          supplier: {
                            supplier_uuid: option.value,
                            supplier_name:
                              selectedSupplier?.supplier_name || "",
                          },
                        });
                      }
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Date</label>
                <Input
                  type="date"
                  value={new Date(
                    editedOrder.delivery_date || "",
                  ).toLocaleDateString()}
                  onChange={(e) =>
                    setEditedOrder({
                      ...editedOrder,
                      delivery_date: e.target.value,
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
                {editedOrder.items?.map((item, index) => (
                  <TableRow key={item.ingredient_uuid}>
                    <TableCell>
                      <CreatableSelect
                        value={
                          item.ingredient_uuid
                            ? [
                                {
                                  label: item.ingredient_name || "",
                                  value: item.ingredient_uuid,
                                },
                              ]
                            : []
                        }
                        size="medium"
                        onChange={(values) => {
                          try {
                            const newItems = Array.isArray(editedOrder.items)
                              ? [...editedOrder.items]
                              : [];
                            const selectedId = values?.value || "";
                            const selectedOption =
                              selectedId && editedOrder.supplier?.supplier_uuid
                                ? getIngredientOptions(
                                    editedOrder.supplier.supplier_uuid,
                                  ).find((opt) => opt.value === selectedId)
                                : null;

                            newItems[index] = {
                              ...newItems[index],
                              ingredient_uuid: selectedId,
                              ingredient_name: selectedOption
                                ? selectedOption.label
                                : selectedId,
                              unit_cost: selectedOption?.unit_cost || 0,
                              unit: selectedOption?.unit || "none",
                              total_cost:
                                (selectedOption?.price || 0) *
                                (newItems[index].quantity || 0),
                            };

                            const newTotal = newItems.reduce(
                              (sum, item) =>
                                sum +
                                (item.quantity || 0) * (item.unit_cost || 0),
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
                          editedOrder.supplier.supplier_uuid,
                        )}
                        placeholder=""
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
                      {editMode ? (
                        <CreatableSelect
                          value={item.unit?.unit_name ? [item.unit.unit_name] : []}
                          onChange={(values) => {
                            if (values[0]) {
                              updateItem(index, "unit", {
                                unit_name: values[0],
                                unit_uuid: values[0],
                              });
                            }
                          }}
                          options={defaultUnits}
                          onCreateOption={(value) => {
                            updateItem(index, "unit", {
                              unit_name: value,
                              unit_uuid: value,
                            });
                          }}
                          size="small"
                        />
                      ) : (
                        <div>{item.unit?.unit_name}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.unit_cost}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unit_cost",
                            parseFloat(e.target.value),
                          )
                        }
                        disabled={!editMode}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      $
                      {((item.quantity || 0) * (item.unit_cost || 0)).toFixed(
                        2,
                      )}
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
                    ${editedOrder.amount?.toFixed(2)}
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