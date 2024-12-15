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
import { Calendar, Building2 } from "lucide-react";
import { type Order } from "@/lib/types";
import { getStatusColor } from "@/lib/data";
import { cn } from "@/lib/utils";
import styles from "./OrderModal.module.css";

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  className?: string;
}

export default function OrderModal({ order, onClose, className }: OrderModalProps) {
  if (!order) return null;

  return (
    <Sheet open={!!order} onOpenChange={() => onClose()}>
      <SheetContent className={cn(styles.modalContent, className)}>
        <SheetHeader>
          <SheetTitle className={styles.header}>
            <span>Order Details</span>
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className={styles.contentContainer}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Building2 className={styles.infoIcon} />
              {order.supplierName}
            </div>
            <div className={styles.infoItem}>
              <Calendar className={styles.infoIcon} />
              {new Date(order.orderDate).toLocaleDateString()}
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
              {order.items.map((item) => (
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
                <TableCell colSpan={4} className={styles.totalRow}>Total</TableCell>
                <TableCell className={styles.totalCell}>
                  ${order.total.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  );
}
