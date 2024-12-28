import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import OrderCard from "@/components/orders/OrderCard";
import OrderTable from "@/components/orders/OrderTable";
import ViewToggle from "@/components/orders/ViewToggle";
import OrderModal from "@/components/orders/OrderModal";
import SubSectionNav from "@/components/layout/SubSectionNav";
import {
  type Order,
  type Supplier,
  type OrderItem,
  type Unit,
} from "@/lib/OrderTypes";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SupplierCard from "@/components/suppliers/SupplierCard";
import SupplierDialog from "@/components/suppliers/SupplierDialog";
import SupplierSheet from "@/components/suppliers/SupplierSheet";
import { orderService } from "@/services/orderService";
import { supplierService } from "@/services/supplierService";
import NewOrderModal from "@/components/orders/NewOrderModal";

export default function Orders() {
  const [activeSection, setActiveSection] = useState("orders");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  const { currentRestaurant } = useRestaurantContext();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return orderService.getRestaurantOrders(
        currentRestaurant.restaurant_uuid,
      );
    },
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
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

  const sections = [
    { id: "orders", label: "Orders" },
    { id: "suppliers", label: "Suppliers" },
  ];

  return (
    <div className="ml-64 w-[calc(100%-16rem)]">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="px-8 mt-6 mb-6 flex items-center justify-end gap-4">
          {activeSection === "orders" && (
            <>
              <ViewToggle current={viewMode} onChange={setViewMode} />
              <Button onClick={() => setShowNewOrderModal(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Order
              </Button>
              <NewOrderModal
                open={showNewOrderModal}
                onOpenChange={setShowNewOrderModal}
                onSave={async (order, status) => {
                  try {
                    if (!currentRestaurant?.restaurant_uuid) {
                      throw new Error("No restaurant selected");
                    }
                    await orderService.createOrder(currentRestaurant.restaurant_uuid, {
                      ...order,
                      status,
                    });
                    queryClient.invalidateQueries(["orders"]);
                    setShowNewOrderModal(false);
                  } catch (error) {
                    console.error("Failed to create order:", error);
                  }
                }}
              />
            </>
          )}
          {activeSection === "suppliers" && (
            <Button onClick={() => setIsNewSupplier(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Supplier
            </Button>
          )}
        </div>

        {activeSection === "orders" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {ordersLoading ? (
              <div className="p-6">Loading orders...</div>
            ) : viewMode === "cards" ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(orders || []).map((order: Order) => (
                  <OrderCard
                    key={order.order_uuid}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                    onEdit={() => {
                      setSelectedOrder(order);
                    }}
                    onApprove={() => {
                      // Handle approve action
                      console.log("Approve order:", order);
                    }}
                  />
                ))}
              </div>
            ) : (
              <OrderTable
                orders={orders || []}
                onOrderClick={(order) => setSelectedOrder(order)}
              />
            )}
          </div>
        )}

        {activeSection === "suppliers" && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            {suppliersLoading ? (
              <div>Loading suppliers...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(suppliers || []).map((supplier: Supplier) => (
                  <SupplierCard
                    key={supplier.supplier_uuid}
                    supplier={supplier}
                    onClick={() => setSelectedSupplier(supplier)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        editMode={selectedOrder?.status === "draft"}
        onSave={(updatedOrder) => {
          // Handle order update here
          console.log("Updated order:", updatedOrder);
        }}
      />

      <SupplierDialog
        open={isNewSupplier}
        onOpenChange={(open) => {
          if (!open) {
            setIsNewSupplier(false);
          }
        }}
        onSubmit={(data) => {
          // In a real app, we would add the supplier to the database here
          console.log("New supplier:", data);
        }}
      />

      <SupplierSheet
        open={!!selectedSupplier}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSupplier(null);
          }
        }}
        supplier={selectedSupplier}
      />
    </div>
  );
}