
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

  const { data: suppliers, suppliersLoading } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("Missing restaurant or supplier UUID");
      }
      return supplierService.getRestaurantSuppliers(
        currentRestaurant?.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
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
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

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

  if (!editedOrder || !order) return null;

  // Rest of the component implementation...
  const getIngredientOptions = (supplierId: string) => {
    if (!ingredients) return [];

    const ingredientsArray = Object.values(ingredients);
    const connectedIngredients = ingredientsArray
      .filter((ing) =>
        ing.ingredient_suppliers?.some(
          (s) => s.supplier?.supplier_uuid === supplierId,
        ),
      )
      .map((ing) => ({
        label: ing.ingredient_name,
        value: ing.ingredient_uuid,
        category: "Connected",
      }));

    const otherIngredients = ingredientsArray
      .filter(
        (ing) =>
          !ing.ingredient_suppliers?.some(
            (s) => s.supplier?.supplier_uuid === supplierId,
          ),
      )
      .map((ing) => ({
        label: ing.ingredient_name,
        value: ing.ingredient_uuid,
        category: "Other",
      }));

    return [...connectedIngredients, ...otherIngredients];
  };

  // Include the rest of your component code here...
  
  return (
    <Sheet open={!!order} onOpenChange={() => onClose()}>
      <SheetContent className="w-[800px] sm:max-w-[800px]">
        {/* Rest of your component JSX */}
      </SheetContent>
    </Sheet>
  );
}
