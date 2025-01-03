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
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
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
  const { currentRestaurant } = useRestaurantContext();
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<string>("");
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);
  const [mergedItems, setMergedItems] = useState<any[]>([]);

  const { data: selectedInvoiceDetails } = useQuery({
    queryKey: ["invoice", currentRestaurant?.restaurant_uuid, selectedInvoice],
    queryFn: async () => {
      if (!currentRestaurant?.restaurant_uuid || !selectedInvoice) return null;
      return documentService.getInvoice(
        currentRestaurant.restaurant_uuid,
        selectedInvoice,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid && !!selectedInvoice,
    onSuccess: (data) => {
      if (!data) return;
      console.log("Invoice data received:", data);

      const orderItems = order?.items || [];
      const invoiceItems = data.ingredients || [];

      // Create a map of existing order items
      const orderItemsMap = new Map(
        orderItems.map((item) => [item.ingredient_uuid, item]),
      );

      console.log("Order items before merge:", orderItems);
      console.log("Invoice items before merge:", invoiceItems);
      console.log("Order items map:", orderItemsMap);

      // Merge invoice items with order items
      const newItems = invoiceItems.map((invoiceItem) => {
        const orderItem = orderItemsMap.get(invoiceItem.ingredient_uuid);
        console.log("Processing invoice item:", invoiceItem);
        console.log("Found matching order item:", orderItem);
        
        const mergedItem = {
          ...orderItem,
          ingredient_uuid: invoiceItem.ingredient_uuid,
          ingredient_name: invoiceItem.ingredient_name,
          quantity: orderItem?.quantity || 0,
          invoice_quantity: invoiceItem.quantity,
          unit: invoiceItem.unit,
          isNewRow: false,
        };
        console.log("Created merged item:", mergedItem);
        return mergedItem;
      });

      console.log("Final merged items:", newItems);
      setMergedItems(newItems);
      setSelectedInvoiceData(data);
    },
  });
  const [receivedQuantities, setReceivedQuantities] = useState<
    Record<string, number>
  >({});

  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return inventoryService.getRestaurantIngredients(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return unitService.getRestaurantUnit(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

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
                value={selectedInvoice || ""}
                onValueChange={(value) => {
                  console.log("Selected invoice value:", value);
                  if (value && value !== "supplier-group" && value !== "other-group") {
                    setSelectedInvoice(value);
                    const invoice = invoices.find(
                      (inv: any) => inv.invoice_uuid === value,
                    );
                    console.log("Found invoice:", invoice);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an invoice">
                    {selectedInvoice
                      ? invoices.find(
                          (inv: any) => inv.invoice_uuid === selectedInvoice,
                        )?.invoice_number
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
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
                value={selectedDeliveryNote}
                onValueChange={(value) => {
                  if (value !== "supplier-group" && value !== "other-group") {
                    setSelectedDeliveryNote(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a delivery note">
                    {selectedDeliveryNote
                      ? invoices.find(
                          (inv: any) =>
                            inv.invoice_uuid === selectedDeliveryNote,
                        )?.invoice_number
                      : "Select a delivery note"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[].map((note: any) => (
                    <SelectItem key={note.id} value={note.id}>
                      {note.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Ordered Quantity</TableHead>
                <TableHead>Invoice Quantity</TableHead>
                <TableHead>Received Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(mergedItems.length > 0 ? mergedItems : order.items)?.map(
                (item) =>
                  item.isNewRow ? (
                    // New row with all inputs
                    <TableRow key={item.ingredient_uuid || "new"}>
                      <TableCell>
                        <CreatableSelect
                          value={
                            item.ingredient_uuid
                              ? {
                                  value: item.ingredient_uuid,
                                  label: item.ingredient_name,
                                }
                              : null
                          }
                          onChange={(option) => {
                            // Handle ingredient selection
                          }}
                          options={[
                            {
                              label: "Associated Ingredients",
                              options: Object.values(ingredients)
                                .filter((ing: any) =>
                                  ing.ingredient_suppliers?.some(
                                    (s: any) =>
                                      s.supplier?.supplier_uuid ===
                                      order?.supplier?.supplier_uuid,
                                  ),
                                )
                                .map((ing: any) => ({
                                  label: ing.ingredient_name,
                                  value: ing.ingredient_uuid,
                                })),
                            },
                            {
                              label: "Other Ingredients",
                              options: Object.values(ingredients)
                                .filter(
                                  (ing: any) =>
                                    !ing.ingredient_suppliers?.some(
                                      (s: any) =>
                                        s.supplier?.supplier_uuid ===
                                        order?.supplier?.supplier_uuid,
                                    ),
                                )
                                .map((ing: any) => ({
                                  label: ing.ingredient_name,
                                  value: ing.ingredient_uuid,
                                })),
                            },
                          ]}
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
                        <CreatableSelect
                          value={
                            item.unit?.unit_name
                              ? {
                                  value: item.unit.unit_uuid,
                                  label: item.unit.unit_name,
                                }
                              : null
                          }
                          onChange={(option) => {
                            if (option) {
                              if (order.items) {
                                const updatedItems = [...order.items];
                                updatedItems[order.items.indexOf(item)].unit = {
                                  unit_uuid: option.value,
                                  unit_name: option.label,
                                };
                                order.items = updatedItems;
                                setReceivedQuantities({
                                  ...receivedQuantities,
                                });
                              }
                            }
                          }}
                          onCreateOption={async (value) => {
                            try {
                              if (!currentRestaurant?.restaurant_uuid) return;
                              const newUnit = await unitService.createUnit(
                                { unit_name: value },
                                currentRestaurant.restaurant_uuid,
                              );
                              if (order.items) {
                                const updatedItems = [...order.items];
                                updatedItems[order.items.indexOf(item)].unit = {
                                  unit_uuid: newUnit.unit_uuid,
                                  unit_name: newUnit.unit_name,
                                };
                                order.items = updatedItems;
                                setReceivedQuantities({
                                  ...receivedQuantities,
                                });
                              }
                            } catch (error) {
                              console.error("Failed to create unit:", error);
                            }
                          }}
                          options={units.map((unit: any) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          placeholder="Select unit"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (order.items) {
                              const index = order.items.indexOf(item);
                              order.items.splice(index, 1);
                              setReceivedQuantities({ ...receivedQuantities });
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
                      <TableCell>{item.invoice_quantity || "-"}</TableCell>
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
                  ),
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
                  isNewRow: true,
                });
                // Force re-render
                setReceivedQuantities({ ...receivedQuantities });
              }
            }}
          >
            Add Row
          </Button>
        </div>

        {selectedInvoiceData && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <div>
                <span className="text-sm text-gray-500">Order Total:</span>
                <span className="ml-2 font-semibold">
                  ${order.amount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Invoice Total:</span>
                <span className="ml-2 font-semibold">
                  ${selectedInvoiceData.amount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>
        )}

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
