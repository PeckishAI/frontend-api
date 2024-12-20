
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import React, { useState } from "react";
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
  const { currentRestaurant } = useRestaurantContext();
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    if (order) {
      setEditedOrder({
        ...order,
        items: order.items || [],
        total: order.total || 0,
        status: order.status || 'draft',
        orderDate: order.orderDate || new Date().toISOString(),
        supplier_name: order.supplier_name || '',
        supplier_uuid: order.supplier_uuid || ''
      });
    }
  }, [order]);

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("Missing restaurant UUID");
      }
      return supplierService.getRestaurantSuppliers(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("Missing restaurant UUID");
      }
      return inventoryService.getRestaurantIngredients(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  if (!editedOrder || !order) return null;

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...editedOrder.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setEditedOrder({
      ...editedOrder,
      items: updatedItems,
      total: calculateTotal(updatedItems),
    });
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const addItem = () => {
    setEditedOrder({
      ...editedOrder,
      items: [
        ...editedOrder.items,
        { id: Date.now().toString(), name: '', quantity: 0, price: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = editedOrder.items.filter((_, i) => i !== index);
    setEditedOrder({
      ...editedOrder,
      items: updatedItems,
      total: calculateTotal(updatedItems),
    });
  };

  const handleSave = () => {
    if (onSave && editedOrder) {
      onSave(editedOrder);
    }
    onClose();
  };

  return (
    <Sheet open={!!order} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:max-w-[800px]">
        <SheetHeader>
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            {editMode ? "Edit order details below" : "View order details below"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{editedOrder.supplier_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(editedOrder.orderDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Badge className={getStatusColor(editedOrder.status)}>
              {editedOrder.status.charAt(0).toUpperCase() + editedOrder.status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Items</h3>
              {editMode && (
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[100px]">Total</TableHead>
                  {editMode && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedOrder.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {editMode ? (
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, 'name', e.target.value)
                          }
                        />
                      ) : (
                        item.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode ? (
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseFloat(e.target.value))
                          }
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode ? (
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(index, 'price', parseFloat(e.target.value))
                          }
                        />
                      ) : (
                        `$${item.price.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
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
              </TableBody>
            </Table>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">
                ${editedOrder.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {editMode && (
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
