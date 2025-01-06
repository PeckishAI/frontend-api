import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order } from "@/lib/OrderTypes";
import { getStatusColor } from "@/lib/data";
import { useRestaurantContext } from "@/contexts/RestaurantContext";

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  onReceive?: () => void;
  onEdit?: () => void;
  onApprove?: () => void;
}

import ApproveOrderDialog from "./ApproveOrderDialog";
import ReceiveOrderModal from "./ReceiveOrderModal";
import { useState } from "react";

export default function OrderCard({
  order,
  onClick,
  onReceive,
  onEdit,
  onApprove,
}: OrderCardProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const handleApprove = (sendEmail: boolean) => {
    onApprove?.(order, sendEmail);
    setShowApproveDialog(false);
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="font-semibold text-xl">
          {order.supplier?.supplier_name}
        </h2>
        <Badge
          className={
            order.status ? getStatusColor(order.status) : "default-class"
          }
        >
          {order.status
            ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
            : "Unknown"}
        </Badge>
      </CardHeader>
      <CardContent className="cursor-pointer" onClick={onClick}>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            {order.delivery_date
              ? new Date(order.delivery_date).toLocaleDateString()
              : "Unknown Date"}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Package className="mr-2 h-4 w-4" />
            {order.ingredients ? order.ingredients.length : 0} items
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-lg font-semibold">
          {useRestaurantContext().currencyInfo?.currencySymbol}
          {order.total_cost ? order.total_cost.toFixed(2) : "0.00"}
        </p>
        <div className="flex gap-2">
          {order.status === "pending" && (
            <>
              <Button size="sm" onClick={() => setShowReceiveModal(true)}>
                Receive Stock
              </Button>
              <ReceiveOrderModal
                open={showReceiveModal}
                onOpenChange={setShowReceiveModal}
                order={order}
                onConfirm={(data) => {
                  console.log("Order received:", data);
                  onReceive?.();
                  setShowReceiveModal(false);
                }}
              />
            </>
          )}
          {order.status === "draft" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit();
                }}
              >
                Edit
              </Button>
              <Button size="sm" onClick={() => setShowApproveDialog(true)}>
                Approve
              </Button>
              <ApproveOrderDialog
                open={showApproveDialog}
                onOpenChange={setShowApproveDialog}
                order={order}
                onConfirm={handleApprove}
              />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
