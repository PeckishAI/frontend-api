import { useState } from 'react';
import { mockOrders } from '@/lib/data';
import OrderCard from '@/components/orders/OrderCard';
import OrderTable from '@/components/orders/OrderTable';
import ViewToggle from '@/components/orders/ViewToggle';
import OrderModal from '@/components/orders/OrderModal';
import { type Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function Orders() {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
          <div className="flex items-center gap-4">
            <ViewToggle current={viewMode} onChange={setViewMode} />
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
