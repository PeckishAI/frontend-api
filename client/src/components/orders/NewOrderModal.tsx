import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { supplierService } from "@/services/supplierService";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { OrderItem, Order, OrderStatus } from "@/types/order";

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (order: any, status: "draft" | "placed") => void;
}

export default function NewOrderModal({
  open,
  onOpenChange,
  onSave,
}: NewOrderModalProps) {
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const { currentRestaurant } = useRestaurantContext();

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return supplierService.getRestaurantSuppliers(
        currentRestaurant.restaurant_uuid,
      );
    },
  });

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return inventoryService.getRestaurantIngredients(
        currentRestaurant.restaurant_uuid,
      );
    },
  });

  const addItem = () => {
    setItems([...items, {}]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "unit_cost") {
      const quantity =
        field === "quantity" ? value : newItems[index].quantity || 0;
      const unit_cost =
        field === "unit_cost" ? value : newItems[index].unit_cost || 0;
      newItems[index].total_cost = quantity * unit_cost;
    }

    setItems(newItems);
  };

  const getTotalCost = () => {
    return items.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  };

  const handleSave = (status: "draft" | "placed") => {
    const order = {
      supplier: selectedSupplier,
      delivery_date: deliveryDate,
      status,
      items,
      amount: getTotalCost(),
    };
    onSave(order, status);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowCancelAlert(true);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Supplier</label>
                <CreatableSelect
                  options={suppliers?.map((supplier: any) => ({
                    label: supplier.supplier_name,
                    value: supplier.supplier_uuid,
                  }))}
                  value={
                    selectedSupplier
                      ? {
                          label: selectedSupplier.supplier_name,
                          value: selectedSupplier.supplier_uuid,
                        }
                      : null
                  }
                  onChange={(option) => {
                    if (option) {
                      setSelectedSupplier({
                        supplier_uuid: option.value,
                        supplier_name: option.label,
                      });
                    }
                  }}
                  placeholder=""
                  size="large"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Delivery Date</label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product_code || "-"}</TableCell>
                    <TableCell>
                      <CreatableSelect
                        value={
                          item.ingredient_uuid
                            ? {
                                label: item.ingredient_name || "",
                                value: item.ingredient_uuid,
                              }
                            : null
                        }
                        onChange={(option) => {
                          if (option) {
                            const selectedIngredient = ingredients?.find(
                              (ing: any) => ing.ingredient_uuid === option.value
                            );
                            
                            updateItem(index, "ingredient_uuid", option.value);
                            updateItem(index, "ingredient_name", option.label);
                            
                            if (selectedIngredient) {
                              updateItem(index, "product_code", selectedIngredient.product_code || "");
                              updateItem(index, "unit_cost", selectedIngredient.unit_cost || 0);
                              updateItem(index, "total_cost", (selectedIngredient.unit_cost || 0) * (item.quantity || 0));
                            }
                          } else {
                            updateItem(index, "ingredient_uuid", "");
                            updateItem(index, "ingredient_name", "");
                            updateItem(index, "product_code", "");
                            updateItem(index, "unit_cost", 0);
                            updateItem(index, "total_cost", 0);
                          }
                        }}
                        options={(() => {
                          if (!selectedSupplier?.supplier_uuid || !ingredients)
                            return [];

                          const selectedSupplierIngredients = ingredients
                            .filter((ing: any) =>
                              ing.ingredient_suppliers?.some(
                                (s: any) =>
                                  s.supplier?.supplier_uuid ===
                                  selectedSupplier.supplier_uuid,
                              ),
                            )
                            .map((ing: any) => ({
                              label: ing.ingredient_name,
                              value: ing.ingredient_uuid,
                            }));

                          const otherIngredients = ingredients
                            .filter(
                              (ing: any) =>
                                !ing.ingredient_suppliers?.some(
                                  (s: any) =>
                                    s.supplier?.supplier_uuid ===
                                    selectedSupplier.supplier_uuid,
                                ),
                            )
                            .map((ing: any) => ({
                              label: ing.ingredient_name,
                              value: ing.ingredient_uuid,
                            }));

                          return [
                            {
                              label: `${selectedSupplier.supplier_name} Ingredients`,
                              options: selectedSupplierIngredients,
                            },
                            {
                              label: "Other Suppliers",
                              options: otherIngredients,
                            },
                          ];
                        })()}
                        placeholder=""
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
                        min={0}
                        step="any"
                      />
                    </TableCell>
                    <TableCell>
                      <CreatableSelect
                        value={
                          item.unit
                            ? {
                                label: item.unit.unit_name,
                                value: item.unit.unit_uuid,
                              }
                            : null
                        }
                        onChange={(option) => {
                          if (option) {
                            updateItem(index, "unit", {
                              unit_uuid: option.value,
                              unit_name: option.label,
                            });
                          }
                        }}
                        options={[]}
                        placeholder=""
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.unit_cost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.total_cost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${getTotalCost().toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>

            <Button variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCancelAlert(true)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave("draft")}>
              Save as Draft
            </Button>
            <Button onClick={() => handleSave("placed")}>Place Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, continue editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCancelAlert(false);
                onOpenChange(false);
                setSelectedSupplier(null);
                setDeliveryDate("");
                setItems([]);
              }}
            >
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}