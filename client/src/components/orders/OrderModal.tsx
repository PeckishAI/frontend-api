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
import { CreatableSelect } from "@/components/ui/creatable-select"; // Assuming this component exists


interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  editMode?: boolean;
  onSave?: (order: Order) => void;
}

export default function OrderModal({ order, onClose, editMode = false, onSave }: OrderModalProps) {
  if (!order) return null;

  const [editedOrder, setEditedOrder] = useState<Order>(order);
  const { restaurant } = useRestaurantContext(); // Assuming this context provides necessary data.

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.getAllSuppliers(restaurant?.id), // Assuming supplierService.getAllSuppliers exists and takes restaurant ID
  });

  const handleSave = () => {
    if (onSave) {
      onSave(editedOrder);
    }
    onClose();
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...editedOrder.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate item total
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const price = field === 'price' ? value : newItems[index].price;
      newItems[index].total = quantity * price;
    }

    // Update order total
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    setEditedOrder({
      ...editedOrder,
      items: newItems,
      total: newTotal
    });
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: `new-${Date.now()}`,
      name: '',
      quantity: 0,
      unit: '',
      price: 0
    };
    setEditedOrder({
      ...editedOrder,
      items: [...editedOrder.items, newItem]
    });
  };

  const removeItem = (index: number) => {
    const newItems = editedOrder.items.filter((_, i) => i !== index);
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setEditedOrder({
      ...editedOrder,
      items: newItems,
      total: newTotal
    });
  };

  const isDraft = editedOrder.status === 'draft';

  const renderNonDraftLayout = () => (
    {isDraft ? (
          <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Supplier</label>
          <div className="font-medium">{editedOrder.supplierName}</div>
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
              <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
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
              {editedOrder.status.charAt(0).toUpperCase() + editedOrder.status.slice(1)}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {isDraft ? (
          <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Supplier</label>
              {isLoading ? (
                <p>Loading suppliers...</p>
              ) : (
                <CreatableSelect
                  options={suppliers?.map(supplier => ({ label: supplier.name, value: supplier.id }))} // Assuming supplier object has name and id properties
                  value={suppliers?.find(supplier => supplier.id === editedOrder.supplierId)} //Assuming editedOrder has supplierId
                  onChange={(e) => setEditedOrder({ ...editedOrder, supplierId: e.value })} // Assuming e.value is the supplierId
                  disabled={!editMode}
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Date</label>
              <Input
                type="date"
                value={new Date(editedOrder.orderDate).toISOString().split('T')[0]}
                onChange={(e) => setEditedOrder({ ...editedOrder, orderDate: e.target.value })}
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
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      disabled={!editMode}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                      disabled={!editMode}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      disabled={!editMode}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
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
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          )}

          {editMode && (
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
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