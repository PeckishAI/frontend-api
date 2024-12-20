
import { useState } from "react";
import { Images, Hash, DollarSign, Package2 } from "lucide-react";
import ViewToggle from "@/components/orders/ViewToggle";
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

export default function Invoices() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editingInvoice, setEditingInvoice] = useState(null);

  const mockInvoices = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      date: new Date(2024, 0, 15),
      price: 1250.99,
      supplier: "Fresh Produce Co.",
      ingredientCount: 15,
      images: ["invoice1.jpg", "invoice1-2.jpg", "invoice1-3.jpg"],
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      date: new Date(2024, 0, 14),
      price: 843.50,
      supplier: "Meat Suppliers Inc.",
      ingredientCount: 8,
      images: ["invoice2.jpg"],
    },
  ];

  function InvoiceCard({ invoice }) {
    return (
      <Card 
        className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:bg-muted/50"
        onClick={() => setEditingInvoice(invoice)}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold">{invoice.invoiceNumber}</CardTitle>
            </div>
            <Badge variant="secondary" className="w-fit">{invoice.supplier}</Badge>
            <div className="text-sm text-muted-foreground">
              {invoice.date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Images className="h-8 w-8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-gray-500">Price</div>
                </div>
                <div className="font-medium">${invoice.price.toFixed(2)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package2 className="h-4 w-4 text-gray-600" />
                  <div className="text-sm text-gray-500">Ingredients</div>
                </div>
                <div className="font-medium">{invoice.ingredientCount}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="ml-64 w-[calc(100%-16rem)]">
      <div className="pt-8 px-8">
        <div className="mb-6 flex items-center justify-end gap-4">
          <ViewToggle current={viewMode} onChange={setViewMode} />
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {viewMode === "cards" ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
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
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Ingredients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow 
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setEditingInvoice(invoice)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Images className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{invoice.images.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        {invoice.date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{invoice.supplier}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${invoice.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{invoice.ingredientCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
