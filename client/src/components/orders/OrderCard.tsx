import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Building2, FileText, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order } from "@/lib/OrderTypes";
import { getStatusColor } from "@/lib/data";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { orderService } from "@/services/orderService";
import { quantityService } from "@/services/quantityService";
import { useQueryClient } from "@tanstack/react-query";

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

  const restaurantUuid =
    useRestaurantContext().currentRestaurant?.restaurant_uuid;
  const queryClient = useQueryClient();

  const handleApprove = (sendEmail: boolean) => {
    onApprove?.(order, sendEmail);
    setShowApproveDialog(false);
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="font-semibold text-xl">
          {order.order_number || "No Order Number"}
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
            <Truck className="mr-2 h-4 w-4" />
            {order.supplier?.supplier_name || "Unknown Supplier"}
          </div>
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
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">
              {useRestaurantContext().currencyInfo?.currencySymbol}
              {order.amount?.toFixed(2) || "0.00"}
            </p>
            <div className="flex items-center gap-2">
              {order.linked_documents?.invoice_uuid ? (
                <Badge variant="secondary" className="bg-green-100">
                  <FileText className="h-4 w-4 text-green-600" />
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100">
                  <FileText className="h-4 w-4 text-red-600" />
                </Badge>
              )}
              {order.linked_documents?.delivery_note_uuid && (
                <Badge variant="secondary" className="bg-blue-100">
                  <Truck className="h-4 w-4 text-blue-600" />
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
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
                onConfirm={async (data) => {
                  console.log("Order received:", data);
                  if (!restaurantUuid || !data.order_uuid) {
                    throw new Error("No restaurant or order selected");
                  }
                  console.log("Adding order :", data.order_uuid);
                  console.log(data);
                  await orderService.updateOrder(
                    restaurantUuid,
                    data.order_uuid,
                    data,
                  );

                  console.log("Adding stock quantities");
                  console.log(data.receivedQuantitiy);
                  await quantityService.createReceiveQuantities(restaurantUuid, {
                    receivedIngredients: data.receivedQuantitiy,
                  });
                  await queryClient.invalidateQueries(["orders"]);
                  await queryClient.invalidateQueries(["inventory"]);
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