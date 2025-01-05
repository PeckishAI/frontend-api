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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoices | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { currentRestaurant } = useRestaurantContext();
  console.log("currencyISO:", currentRestaurant?.currencySymbol.currency);

  const {
    data: invoices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invoices", currentRestaurant?.restaurant_uuid],
    queryFn: async () => {
      if (!currentRestaurant?.restaurant_uuid) {
        console.error("InvoicesView: No restaurant UUID available");
        throw new Error("No restaurant selected");
      }

      try {
        const result = await documentService.getRestaurantInvoices(
          currentRestaurant.restaurant_uuid,
        );
        return result;
      } catch (err) {
        console.error("InvoicesView: API call failed:", err);
        throw err;
      }
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  if (error) {
    console.error("InvoicesView: Error in query:", error);
  }

  const handleSort = (column: string) => {
    setSortColumn(column);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <>
      {viewMode === "cards" ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 text-center py-8">
              Loading invoices...
            </div>
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
                <TableHead
                  sortable
                  sortKey="documents"
                  sortDirection={
                    sortColumn === "documents" ? sortDirection : undefined
                  }
                  onSort={() => handleSort("documents")}
                >
                  Images
                </TableHead>
                <TableHead
                  sortable
                  sortKey="invoice_number"
                  sortDirection={
                    sortColumn === "invoice_number" ? sortDirection : undefined
                  }
                  onSort={() => handleSort("invoice_number")}
                >
                  Invoice Number
                </TableHead>
                <TableHead
                  sortable
                  sortKey="date"
                  sortDirection={
                    sortColumn === "date" ? sortDirection : undefined
                  }
                  onSort={() => handleSort("date")}
                >
                  Date
                </TableHead>
                <TableHead
                  sortable
                  sortKey="supplier_name"
                  sortDirection={
                    sortColumn === "supplier_name" ? sortDirection : undefined
                  }
                  onSort={() => handleSort("supplier_name")}
                >
                  Supplier
                </TableHead>
                <TableHead
                  sortable
                  sortKey="amount"
                  sortDirection={
                    sortColumn === "amount" ? sortDirection : undefined
                  }
                  onSort={() => handleSort("amount")}
                  className="text-right"
                >
                  Amount
                </TableHead>
                <TableHead
                  sortable
                  sortKey="ingredients"
                  sortDirection={
                    sortColumn === "ingredients" ? sortDirection : undefined
                  }
                  onSort={() => handleSort("ingredients")}
                  className="text-right"
                >
                  Ingredients
                </TableHead>
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
                [...invoices]
                  .sort((a, b) => {
                    if (!sortColumn) return 0;

                    let aValue = a[sortColumn];
                    let bValue = b[sortColumn];

                    if (sortColumn === "documents") {
                      aValue = a.documents ? 1 : 0;
                      bValue = b.documents ? 1 : 0;
                    }
                    if (sortColumn === "ingredients") {
                      aValue = a.ingredients?.length || 0;
                      bValue = b.ingredients?.length || 0;
                    }

                    if (sortColumn === "date") {
                      aValue = new Date(a.date || "").getTime();
                      bValue = new Date(b.date || "").getTime();
                    }

                    if (sortColumn === "supplier_name") {
                      aValue = a.supplier?.supplier_name || "";
                      bValue = b.supplier?.supplier_name || "";
                    }

                    if (sortColumn === "amount") {
                      aValue = a.amount || 0;
                      bValue = b.amount || 0;
                    }

                    if (sortColumn === "invoice_number") {
                      aValue = a.invoice_number || "";
                      bValue = b.invoice_number || "";
                    }

                    if (
                      typeof aValue === "string" &&
                      typeof bValue === "string"
                    ) {
                      aValue = aValue.toLowerCase();
                      bValue = bValue.toLowerCase();
                    }

                    if (aValue < bValue)
                      return sortDirection === "asc" ? -1 : 1;
                    if (aValue > bValue)
                      return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  })
                  .map((invoice) => (
                    <TableRow
                      key={invoice.invoice_uuid || `temp-${Math.random()}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Images className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {invoice.documents?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.invoice_number || "N/A"}</TableCell>
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
