
import { Hash, User2, Images, DollarSign, Package2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Invoices } from "@/lib/DocumentTypes";

interface InvoiceCardProps {
  invoice: Invoices;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">
              {invoice.invoice_number}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {invoice.supplier?.supplier_name || "Unknown Supplier"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {invoice.date ? new Date(invoice.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }) : "-"}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <span className="font-medium">${invoice.amount?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package2 className="h-4 w-4 text-gray-600" />
              <span className="font-medium">{invoice.ingredients?.length || 0}</span>
              <span className="text-sm text-gray-500">items</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
