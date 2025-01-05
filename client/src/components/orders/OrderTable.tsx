
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
import { type Order } from "@/lib/OrderTypes";
import { getStatusColor } from "@/lib/data";
import { useState } from "react";
import { useRestaurantContext } from "@/contexts/RestaurantContext";

interface OrderTableProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onReceive?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onApprove?: (order: Order) => void;
}

export default function OrderTable({
  orders,
  onOrderClick,
  onReceive,
  onEdit,
  onApprove,
}: OrderTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    setSortColumn(column);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue, bValue;

    switch (sortColumn) {
      case 'supplier':
        aValue = a.supplier?.supplier_name || '';
        bValue = b.supplier?.supplier_name || '';
        break;
      case 'date':
        aValue = new Date(a.delivery_date).getTime();
        bValue = new Date(b.delivery_date).getTime();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'items':
        aValue = a.items.length;
        bValue = b.items.length;
        break;
      case 'total':
        aValue = a.amount;
        bValue = b.amount;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortKey="supplier" sortDirection={sortColumn === 'supplier' ? sortDirection : undefined} onSort={() => handleSort('supplier')}>
              Supplier
            </TableHead>
            <TableHead sortable sortKey="date" sortDirection={sortColumn === 'date' ? sortDirection : undefined} onSort={() => handleSort('date')}>
              Date
            </TableHead>
            <TableHead sortable sortKey="status" sortDirection={sortColumn === 'status' ? sortDirection : undefined} onSort={() => handleSort('status')}>
              Status
            </TableHead>
            <TableHead sortable sortKey="items" sortDirection={sortColumn === 'items' ? sortDirection : undefined} onSort={() => handleSort('items')}>
              Items
            </TableHead>
            <TableHead sortable sortKey="total" sortDirection={sortColumn === 'total' ? sortDirection : undefined} onSort={() => handleSort('total')} className="text-right">
              Total
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow key={order.order_uuid}>
              <TableCell
                className="font-medium cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                {order.supplier?.supplier_name}
              </TableCell>
              <TableCell
                className="cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                {new Date(order.delivery_date).toLocaleDateString()}
              </TableCell>
              <TableCell
                className="cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell
                className="cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                {order.items.length} items
              </TableCell>
              <TableCell
                className="text-right cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                {useRestaurantContext().currencyInfo?.currencySymbol}{order.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button size="sm" onClick={() => onReceive?.(order)}>
                      Receive Stock
                    </Button>
                  )}
                  {order.status === "draft" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit?.(order)}
                      >
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
