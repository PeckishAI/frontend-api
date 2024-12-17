import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import OrderCard from '@/components/orders/OrderCard';
import OrderTable from '@/components/orders/OrderTable';
import ViewToggle from '@/components/orders/ViewToggle';
import OrderModal from '@/components/orders/OrderModal';
import SubSectionNav from '@/components/layout/SubSectionNav';
import { type Order, type Supplier } from '@/lib/types';
import { mockOrders } from '@/mockData/orders';
import { mockSuppliers } from '@/mockData/suppliers';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import SupplierCard from '@/components/suppliers/SupplierCard';
import SupplierDialog from '@/components/suppliers/SupplierDialog';
import SupplierSheet from '@/components/suppliers/SupplierSheet';
import { useToast } from '@/hooks/use-toast';

export default function Orders() {
  const [activeSection, setActiveSection] = useState('orders');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  
  const { currentRestaurant } = useRestaurantContext();

const { data: orders = [], isLoading: ordersLoading } = useQuery({
  queryKey: ["orders", currentRestaurant?.restaurant_uuid],
  queryFn: () => {
    if (!currentRestaurant?.restaurant_uuid) {
      throw new Error("No restaurant selected");
    }
    return orderService.getRestaurantOrders(currentRestaurant.restaurant_uuid);
  },
  enabled: !!currentRestaurant?.restaurant_uuid,
  select: (data) => {
    if (!data?.data) return [];
    return data.data.map((order: any) => ({
      id: order.order_uuid,
      supplierName: order.supplier_name,
      orderDate: order.created_at,
      status: order.status,
      total: order.price || 0,
      items: order.items.map((item: any) => ({
        id: item.ingredient_uuid,
        name: "Item", // You may want to fetch ingredient names separately
        quantity: item.quantity || 0,
        unit: item.unit_name || '',
        price: item.price || 0
      }))
    }));
  }
});

// Still using mock suppliers for now
const suppliers = mockSuppliers;
const suppliersLoading = false;

  const sections = [
    { id: 'orders', label: 'Orders' },
    { id: 'suppliers', label: 'Suppliers' },
  ];

  return (
    <div className="ml-64 w-full">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="px-8 mt-6 mb-6 flex items-center justify-end gap-4">
          {activeSection === 'orders' && (
            <>
              <ViewToggle current={viewMode} onChange={setViewMode} />
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </>
          )}
          {activeSection === 'suppliers' && (
            <Button onClick={() => setIsNewSupplier(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Supplier
            </Button>
          )}
        </div>

        {activeSection === 'orders' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {ordersLoading ? (
                <div className="p-6">Loading orders...</div>
              ) : viewMode === 'cards' ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(orders || []).map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
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

        {activeSection === 'suppliers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            {suppliersLoading ? (
              <div>Loading suppliers...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(suppliers || []).map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
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
          console.log('New supplier:', data);
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