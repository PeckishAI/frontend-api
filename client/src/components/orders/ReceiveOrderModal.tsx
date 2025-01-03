import React, { useState, useEffect } from "react";
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
import { BasicSelect } from "@/components/ui/basic-select";
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

  // We'll store a merged list of items here once an invoice is chosen
  const [mergedItems, setMergedItems] = useState<any[]>([]);

  // Track the received quantities by ingredient_uuid
  const [receivedQuantities, setReceivedQuantities] = useState<
    Record<string, number>
  >({});

  // Pre-populate receivedQuantities with the order’s quantities
  useEffect(() => {
    if (order?.items) {
      const initialQuantities: Record<string, number> = {};
      for (const item of order.items) {
        if (item.ingredient_uuid) {
          initialQuantities[item.ingredient_uuid] = item.quantity || 0;
        }
      }
      setReceivedQuantities(initialQuantities);
    }
  }, [order]);

  // Fetch invoice details when selectedInvoice changes
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
    onSuccess: (invoiceData) => {
      if (!invoiceData) return;

      console.log("Invoice data received:", invoiceData);
      setSelectedInvoiceData(invoiceData);

      // Merge invoice items + existing order items
      const orderItems = order?.items || [];
      const invoiceItems = invoiceData.ingredients || [];

      // Map for quick lookups of order items
      const orderItemsMap = new Map(
        orderItems.map((item) => [item.ingredient_uuid, item]),
      );

      // 1. Combine all invoice items with any matching order items
      const newItems = invoiceItems.map((invItem) => {
        const existingOrderItem = orderItemsMap.get(invItem.ingredient_uuid);

        return {
          // existing order fields
          ...(existingOrderItem || {}),
          // override with invoice data
          ingredient_uuid: invItem.ingredient_uuid,
          ingredient_name: invItem.ingredient_name,
          quantity: existingOrderItem?.quantity || 0,
          invoice_quantity: invItem.quantity,
          unit: invItem.unit || existingOrderItem?.unit,
          isNewRow: false,
        };
      });

      // 2. Add any order items that aren't in the invoice
      for (const item of orderItems) {
        const alreadyInNewItems = newItems.some(
          (row) => row.ingredient_uuid === item.ingredient_uuid,
        );
        if (!alreadyInNewItems) {
          newItems.push(item);
        }
      }

      console.log("Final merged items:", newItems);
      setMergedItems(newItems);
    },
  });

  // Fetch all data needed: invoices, ingredients, units, etc.
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

  // Determine which array of items to display in the table:
  // If no invoice has been selected, show the original order items.
  // If an invoice is selected, show the merged items.
  const tableItems = selectedInvoice ? mergedItems : order?.items || [];

  // Split invoices by matching supplier or not
  const supplierInvoices = invoices.filter(
    (inv: any) =>
      inv.supplier?.supplier_uuid === order?.supplier?.supplier_uuid,
  );
  const otherInvoices = invoices.filter(
    (inv: any) =>
      inv.supplier?.supplier_uuid !== order?.supplier?.supplier_uuid,
  );
  console.log("Supplier invoices:", supplierInvoices);

  // On confirm, we always send the mergedItems because
  // if no invoice was selected, mergedItems will be empty,
  // but we can fallback to the original order items if needed.
  const handleConfirm = () => {
    // If no invoice is selected, just use order.items for the payload
    const finalItems = selectedInvoice ? mergedItems : order?.items || [];

    const payload = {
      order_uuid: order?.order_uuid,
      document_uuid: selectedInvoice,
      items: finalItems.map((item) => ({
        ingredient_uuid: item.ingredient_uuid,
        ordered_quantity: item.quantity || 0,
        received_quantity: receivedQuantities[item.ingredient_uuid || ""] || 0,
        unit: item.unit,
      })),
    };
    console.log("Receiving stock with payload:", payload);
    onConfirm(payload);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        {/* -- You can add a DialogDescription here if you want to avoid the missing description warning */}
        <DialogHeader>
          <DialogTitle>Receive Stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Invoice Select */}
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                Match Invoice
              </label>
              <BasicSelect
                value={
                  selectedInvoice
                    ? {
                        value: selectedInvoice,
                        label:
                          invoices.find(
                            (inv: any) => inv.document_uuid === selectedInvoice,
                          )?.invoice_number || "",
                      }
                    : null
                }
                onChange={(option) => {
                  console.log("Selected invoice:", option);
                  setSelectedInvoice(option?.value);
                }}
                options={[
                  {
                    label:
                      order?.supplier?.supplier_name || "Supplier Invoices",
                    options: supplierInvoices.map((inv: any) => ({
                      value: inv.document_uuid,
                      label: inv.invoice_number,
                    })),
                  },
                  {
                    label: "Other Suppliers",
                    options: otherInvoices.map((inv: any) => ({
                      value: inv.document_uuid,
                      label: inv.invoice_number,
                    })),
                  },
                ]}
                placeholder="Select an invoice"
                size="large"
              />
            </div>

            {/* Delivery Note Select (stubbed for now) */}
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                Match Delivery Note
              </label>
              <BasicSelect
                value={
                  selectedDeliveryNote
                    ? {
                        value: selectedDeliveryNote,
                        label: `Delivery Note #${selectedDeliveryNote}`,
                      }
                    : null
                }
                onChange={(option) => {
                  console.log("Selected delivery note:", option);
                  setSelectedDeliveryNote(option?.value || "");
                }}
                options={[
                  { value: "DN-1234", label: "DN-1234" },
                  { value: "DN-5678", label: "DN-5678" },
                ]}
                placeholder="Select a delivery note"
                size="large"
              />
            </div>
          </div>

          {/* Table of items */}
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
              {tableItems.map((item, index) =>
                item.isNewRow ? (
                  <TableRow key={item.ingredient_uuid || `new-${index}`}>
                    {/* CREATION ROW */}
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
                          // handle ingredient selection
                        }}
                        options={[
                          {
                            label: "Associated Ingredients",
                            options: ingredients
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
                            options: ingredients
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
                          // handle quantity change
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.invoice_quantity || 0}
                        onChange={(e) => {
                          // handle invoice qty change
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
                            setReceivedQuantities((prev) => ({
                              ...prev,
                              [item.ingredient_uuid]:
                                parseFloat(e.target.value) || 0,
                            }));
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
                          // handle unit change
                        }}
                        onCreateOption={async (value) => {
                          // handle create new unit
                        }}
                        options={units.map((u: any) => ({
                          label: u.unit_name,
                          value: u.unit_uuid,
                        }))}
                        placeholder="Select unit"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // remove row from tableItems
                          setMergedItems((prev) =>
                            prev.filter(
                              (row) =>
                                row.ingredient_uuid !== item.ingredient_uuid,
                            ),
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={item.ingredient_uuid || `row-${index}`}>
                    <TableCell>{item.ingredient_name}</TableCell>
                    <TableCell>{item.quantity || 0}</TableCell>
                    <TableCell>{item.invoice_quantity ?? "-"}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={
                          receivedQuantities[item.ingredient_uuid || ""] || 0
                        }
                        onChange={(e) => {
                          if (item.ingredient_uuid) {
                            setReceivedQuantities((prev) => ({
                              ...prev,
                              [item.ingredient_uuid]:
                                parseFloat(e.target.value) || 0,
                            }));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.unit?.unit_name || "-"}</TableCell>
                    <TableCell />
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>

          {/* Button to add a new row */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              // If an invoice is selected, we add a row to mergedItems
              // If no invoice, we actually need to add it to order.items or both
              if (selectedInvoice) {
                setMergedItems((prev) => [
                  ...prev,
                  {
                    ingredient_uuid: "",
                    ingredient_name: "",
                    quantity: 0,
                    invoice_quantity: 0,
                    unit: { unit_name: "", unit_uuid: "" },
                    isNewRow: true,
                  },
                ]);
              } else {
                // no invoice selected => push a new item into the order array
                if (order) {
                  order.items.push({
                    ingredient_uuid: "",
                    ingredient_name: "",
                    quantity: 0,
                    unit: { unit_name: "", unit_uuid: "" },
                    isNewRow: true,
                  });
                  // force re-render
                  setReceivedQuantities((prev) => ({ ...prev }));
                }
              }
            }}
          >
            Add Row
          </Button>
        </div>

        {/* If we have invoice data, display totals */}
        {selectedInvoiceData && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <div>
                <span className="text-sm text-gray-500">Order Total:</span>
                <span className="ml-2 font-semibold">
                  ${order?.amount?.toFixed(2) || "0.00"}
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
