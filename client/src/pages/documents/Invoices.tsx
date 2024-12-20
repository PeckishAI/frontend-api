
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Images, Hash, DollarSign, Package2, User2 } from "lucide-react";
import ViewToggle from "@/components/orders/ViewToggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditInvoiceSlider } from "@/components/documents/EditInvoiceSlider";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { documentService } from "@/services/documentService";
import { InvoiceCard } from "@/components/documents/InvoiceCard";
import type { Invoices } from "@/lib/DocumentTypes";

export default function Invoices() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editingInvoice, setEditingInvoice] = useState<Invoices | null>(null);
  const { currentRestaurant } = useRestaurantContext();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return documentService.getRestaurantInvoices(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  return (
    <div className="ml-64 w-[calc(100%-16rem)]">
      <div className="pt-8 px-8">
        <div className="mb-6 flex items-center justify-end gap-4">
          <ViewToggle current={viewMode} onChange={setViewMode} />
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-3 text-center py-8">Loading invoices...</div>
                ) : (
                  invoices.map((invoice) => (
                    <div
                      key={invoice.invoice_uuid}
                      onClick={() => setEditingInvoice(invoice)}
                      className="cursor-pointer"
                    >
                      <InvoiceCard invoice={invoice} />
                    </div>
                  ))
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Images</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Ingredients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow
                        key={invoice.invoice_uuid}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setEditingInvoice(invoice)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Images className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">
                              {invoice.documents ? 1 : 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>
                          {invoice.date ? new Date(invoice.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{invoice.supplier?.[0]?.supplier_name || '-'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          ${invoice.amount?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.ingredients?.length || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
      <EditInvoiceSlider
        invoice={editingInvoice}
        open={editingInvoice !== null}
        onOpenChange={(open) => !open && setEditingInvoice(null)}
      />
    </div>
  );
}
