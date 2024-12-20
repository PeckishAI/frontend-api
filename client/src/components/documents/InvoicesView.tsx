
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Images, Hash, DollarSign, Package2, User2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditInvoiceSlider } from "@/components/documents/EditInvoiceSlider";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { documentService } from "@/services/documentService";
import { InvoiceCard } from "@/components/documents/InvoiceCard";
import type { Invoices } from "@/lib/DocumentTypes";

interface InvoicesViewProps {
  viewMode: "cards" | "table";
}

export default function InvoicesView({ viewMode }: InvoicesViewProps) {
  console.log("InvoicesView: Component initialization");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoices | null>(null);
  const { currentRestaurant } = useRestaurantContext();

  console.log("Current restaurant context:", currentRestaurant);

  console.log("InvoicesView component mounted");
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ["invoices", currentRestaurant?.restaurant_uuid],
    queryFn: async () => {
      console.log("InvoicesView: Starting fetch for restaurant:", currentRestaurant?.restaurant_uuid);
      if (!currentRestaurant?.restaurant_uuid) {
        console.error("InvoicesView: No restaurant UUID available");
        throw new Error("No restaurant selected");
      }

      try {
        const result = await documentService.getRestaurantInvoices(
          currentRestaurant.restaurant_uuid,
        );
        console.log("InvoicesView: API call successful, received data:", result);
        return result;
      } catch (err) {
        console.error("InvoicesView: API call failed:", err);
        throw err;
      }
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  console.log("InvoicesView render state:", { 
    loading: isLoading, 
    error, 
    invoicesCount: invoices?.length,
    invoices 
  });

  if (error) {
    console.error("InvoicesView: Error in query:", error);
  }

  return (
    <>
      {viewMode === "cards" ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 text-center py-8">Loading invoices...</div>
          ) : invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <div
                key={invoice.invoice_uuid || `temp-${Math.random()}`}
                onClick={() => setSelectedInvoice(invoice)}
                className="cursor-pointer"
              >
                <InvoiceCard invoice={invoice} />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">No invoices found</div>
          )}
        </div>
      ) : (
        <div className="p-6">
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
              ) : invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow
                    key={invoice.invoice_uuid || `temp-${Math.random()}`}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Images className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {invoice.documents ? 1 : 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.invoice_number || 'N/A'}</TableCell>
                    <TableCell>
                      {invoice.date
                        ? new Date(invoice.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {invoice.supplier?.supplier_name || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${invoice.amount?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.ingredients?.length || 0}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <EditInvoiceSlider
        invoice={selectedInvoice}
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      />
    </>
  );
}
