import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Supplier } from "@/lib/types";
import SupplierSheet from "@/components/suppliers/SupplierSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { supplierService } from "@/services/supplierService";

export default function Suppliers() {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const { currentRestaurant } = useRestaurantContext();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return supplierService.getRestaurantSuppliers(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Suppliers</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button
          onClick={() => {
            setSelectedSupplier(null);
            setIsSheetOpen(true);
          }}
        >
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers?.map((supplier: Supplier) => (
          <Card
            key={supplier.supplier_uuid}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setSelectedSupplier(supplier);
              setIsSheetOpen(true);
            }}
          >
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">{supplier.supplier_name}</h3>
              <p className="text-sm text-gray-500">{supplier.category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SupplierSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        supplier={selectedSupplier}
        onSubmit={async (data) => {
          if (!currentRestaurant?.restaurant_uuid) return;
          await supplierService.createSupplier(currentRestaurant.restaurant_uuid, data);
          queryClient.invalidateQueries(["suppliers", currentRestaurant.restaurant_uuid]);
          setIsSheetOpen(false);
        }}
      />
    </div>
  );
}
