import { useState } from 'react';
import { mockOrders } from '@/lib/data';
import OrderCard from '@/components/orders/OrderCard';
import OrderTable from '@/components/orders/OrderTable';
import ViewToggle from '@/components/orders/ViewToggle';
import OrderModal from '@/components/orders/OrderModal';
import SubSectionNav from '@/components/layout/SubSectionNav';
import { type Order, type Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import SupplierCard from '@/components/suppliers/SupplierCard';
import SupplierDialog from '@/components/suppliers/SupplierDialog';
import SupplierSheet from '@/components/suppliers/SupplierSheet';

export default function Orders() {
  const [activeSection, setActiveSection] = useState('orders');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  
  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/suppliers"],
  });

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
            {viewMode === 'cards' ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            ) : (
              <OrderTable
                orders={mockOrders}
                onOrderClick={(order) => setSelectedOrder(order)}
              />
            )}
          </div>
        )}

        {activeSection === 'suppliers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers?.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  onClick={() => setSelectedSupplier(supplier)}
                />
              ))}
            </div>
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
