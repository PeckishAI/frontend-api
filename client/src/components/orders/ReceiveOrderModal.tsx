import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { CreatableSelect } from "@/components/ui/creatable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Order } from "@/types/order";
import { useQuery } from "@tanstack/react-query";
import { documentService } from "@/services/documentService";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { Trash2 } from "lucide-react";

interface ReceiveOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onConfirm: (data: any) => void;
}

export default function ReceiveOrderModal({
  open,
  onOpenChange,
  order,
  onConfirm,
}: ReceiveOrderModalProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [receivedQuantities, setReceivedQuantities] = useState<
    Record<string, number>
  >({});
  const { currentRestaurant } = useRestaurantContext();

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return documentService.getRestaurantInvoices(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  // Initialize received quantities with order quantities
  React.useEffect(() => {
    if (order?.items) {
      const initialQuantities: Record<string, number> = {};
      order.items.forEach((item) => {
        if (item.ingredient_uuid) {
          initialQuantities[item.ingredient_uuid] = item.quantity || 0;
        }
      });
      setReceivedQuantities(initialQuantities);
    }
  }, [order]);

  if (!order) return null;

  const handleConfirm = () => {
    const payload = {
      order_uuid: order.order_uuid,
      invoice_uuid: selectedInvoice,
      items: order.items?.map((item) => ({
        ingredient_uuid: item.ingredient_uuid,
        ordered_quantity: item.quantity,
        received_quantity: receivedQuantities[item.ingredient_uuid || ""] || 0,
        unit: item.unit,
      })),
    };
    console.log("Receiving stock with payload:", payload);
    onConfirm(payload);
  };

  const supplierInvoices = invoices.filter(
    (inv: any) => inv.supplier?.supplier_uuid === order.supplier?.supplier_uuid,
  );
  const otherInvoices = invoices.filter(
    (inv: any) => inv.supplier?.supplier_uuid !== order.supplier?.supplier_uuid,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Receive Stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                Match Invoice
              </label>
              <Select
                value={selectedInvoice}
                onValueChange={setSelectedInvoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an invoice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select" disabled>
                    Select an invoice
                  </SelectItem>
                  {supplierInvoices.length > 0 && (
                    <>
                      <SelectItem value="supplier-group" disabled>
                        {order.supplier?.supplier_name}
                      </SelectItem>
                      {supplierInvoices.map((inv: any) => (
                        <SelectItem
                          key={inv.invoice_uuid}
                          value={inv.invoice_uuid}
                        >
                          {inv.invoice_number}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {otherInvoices.length > 0 && (
                    <>
                      <SelectItem value="other-group" disabled>
                        Other Suppliers
                      </SelectItem>
                      {otherInvoices.map((inv: any) => (
                        <SelectItem
                          key={inv.invoice_uuid}
                          value={inv.invoice_uuid}
                        >
                          {inv.invoice_number}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                Match Delivery Note
              </label>
              <Select
                value={selectedInvoice}
                onValueChange={setSelectedInvoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a delivery note" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select" disabled>
                    Select a delivery note
                  </SelectItem>
                  {supplierInvoices.length > 0 && (
                    <>
                      <SelectItem value="supplier-group" disabled>
                        {order.supplier?.supplier_name}
                      </SelectItem>
                      {supplierInvoices.map((inv: any) => (
                        <SelectItem
                          key={inv.invoice_uuid}
                          value={inv.invoice_uuid}
                        >
                          {inv.invoice_number}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {otherInvoices.length > 0 && (
                    <>
                      <SelectItem value="other-group" disabled>
                        Other Suppliers
                      </SelectItem>
                      {otherInvoices.map((inv: any) => (
                        <SelectItem
                          key={inv.invoice_uuid}
                          value={inv.invoice_uuid}
                        >
                          {inv.invoice_number}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Ordered Quantity</TableHead>
                <TableHead>Received Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => 
                item.isNewRow ? (
                  // New row with all inputs
                  <TableRow key={item.ingredient_uuid || 'new'}>
                    <TableCell>
                      <CreatableSelect
                        value={item.ingredient_uuid ? {
                          value: item.ingredient_uuid,
                          label: item.ingredient_name
                        } : null}
                        onChange={(option) => {
                          // Handle ingredient selection
                        }}
                        options={[]} // Add your ingredient options here
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          // Handle quantity change
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={
                          receivedQuantities[item.ingredient_uuid || ""] || 0
                        }
                        onChange={(e) => {
                          if (item.ingredient_uuid) {
                            setReceivedQuantities({
                              ...receivedQuantities,
                              [item.ingredient_uuid]:
                                parseFloat(e.target.value) || 0,
                            });
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={item.unit?.unit_name || "Select unit"} />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Add your unit options here */}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (order.items) {
                            const index = order.items.indexOf(item);
                            order.items.splice(index, 1);
                            setReceivedQuantities({...receivedQuantities});
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Existing row with spans except received quantity
                  <TableRow key={item.ingredient_uuid}>
                    <TableCell>{item.ingredient_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={
                          receivedQuantities[item.ingredient_uuid || ""] || 0
                        }
                        onChange={(e) => {
                          if (item.ingredient_uuid) {
                            setReceivedQuantities({
                              ...receivedQuantities,
                              [item.ingredient_uuid]:
                                parseFloat(e.target.value) || 0,
                            });
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.unit?.unit_name}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            className="mt-4"
            onClick={() => {
              if (order.items) {
                order.items.push({
                  ingredient_uuid: "",
                  ingredient_name: "",
                  quantity: 0,
                  unit: { unit_name: "", unit_uuid: "" },
                  isNewRow: true
                });
                // Force re-render
                setReceivedQuantities({...receivedQuantities});
              }
            }}
          >
            Add Row
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
