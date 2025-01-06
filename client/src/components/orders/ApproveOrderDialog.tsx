
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type Order } from "@/types/order";
import { useRestaurantContext } from "@/contexts/RestaurantContext";

interface ApproveOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onConfirm: (sendEmail: boolean, payload: any) => void;
}

export default function ApproveOrderDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: ApproveOrderDialogProps) {
  const [sendEmail, setSendEmail] = useState(true);

  if (!order) return null;

  const handleApprove = (sendEmail: boolean) => {
    const formattedOrder = {
      ...order,
      ingredients: order.items?.map(item => ({
        uuid: item.uuid || "",
        ingredient_uuid: item.ingredient_uuid || "",
        ingredient_name: item.ingredient_name || "",
        quantity: item.quantity || 0,
        unit: {
          unit_uuid: item.unit?.unit_uuid || "",
          unit_name: item.unit?.unit_name || ""
        },
        unit_cost: item.unit_cost || 0,
        total_cost: item.total_cost || 0,
        product_code: item.product_code || ""
      })),
      total_cost: order.amount || 0,
      delivery_date: order.delivery_date || null,
      order_date: new Date().toISOString(),
      note: order.note || "",
      supplier: {
        supplier_uuid: order.supplier?.supplier_uuid || "",
        supplier_name: order.supplier?.supplier_name || ""
      },
      user: order.user || { user_uuid: "", username: "" }
    };
    
    onConfirm(sendEmail, formattedOrder);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Approve Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Order Number</div>
              <div className="font-medium">{order.order_number || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Order Date</div>
              <div className="font-medium">
                {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Delivery Date</div>
              <div className="font-medium">
                {order.delivery_date
                  ? new Date(order.delivery_date).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Supplier</div>
              <div className="font-medium">
                {order.supplier?.supplier_name || "N/A"}
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.ingredient_uuid}>
                  <TableCell>{item.ingredient_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit?.unit_name}</TableCell>
                  <TableCell className="text-right">
                    {useRestaurantContext().currencyInfo?.currencySymbol}
                    {item.unit_cost?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell className="text-right">
                    {useRestaurantContext().currencyInfo?.currencySymbol}
                    {item.total_cost?.toFixed(2) || "0.00"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {useRestaurantContext().currencyInfo?.currencySymbol}
                  {order.amount?.toFixed(2) || "0.00"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <label
              htmlFor="sendEmail"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send email to supplier
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleApprove(sendEmail)}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
