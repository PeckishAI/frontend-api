
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Order } from "@/lib/types";
import { getStatusColor } from "@/lib/data";

interface OrderTableProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onReceive?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onApprove?: (order: Order) => void;
}

export default function OrderTable({ orders, onOrderClick, onReceive, onEdit, onApprove }: OrderTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium cursor-pointer" onClick={() => onOrderClick(order)}>
                {order.supplierName}
              </TableCell>
              <TableCell className="cursor-pointer" onClick={() => onOrderClick(order)}>
                {new Date(order.orderDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="cursor-pointer" onClick={() => onOrderClick(order)}>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="cursor-pointer" onClick={() => onOrderClick(order)}>
                {order.items.length} items
              </TableCell>
              <TableCell className="text-right cursor-pointer" onClick={() => onOrderClick(order)}>
                ${order.total.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <Button size="sm" onClick={() => onReceive?.(order)}>
                      Receive Stock
                    </Button>
                  )}
                  {order.status === 'draft' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => onEdit?.(order)}>
                        Edit
                      </Button>
                      <Button size="sm" onClick={() => onApprove?.(order)}>
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
