import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package } from "lucide-react";
import { type Order } from "@/lib/types";
import { getStatusColor } from "@/lib/data";

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="font-semibold text-xl">{order.supplierName}</h2>
        <Badge className={getStatusColor(order.status)}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date(order.orderDate).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Package className="mr-2 h-4 w-4" />
            {order.items.length} items
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-lg font-semibold">
          ${order.total.toFixed(2)}
        </p>
      </CardFooter>
    </Card>
  );
}
