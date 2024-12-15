import { useState } from 'react';
import { FileText, FileBox, ClipboardCheck, Images, ChevronLeft, ChevronRight, Hash, DollarSign, Building2, Package2, Pencil } from "lucide-react";
import SubSectionNav from "@/components/layout/SubSectionNav";
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
import { Button } from "@/components/ui/button";
import { EditInvoiceSlider } from "@/components/documents/EditInvoiceSlider";
import { Badge } from "@/components/ui/badge";

const mockInvoices: Invoice[] = [
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
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    date: new Date(2024, 0, 13),
    price: 567.25,
    supplier: "Grocery Wholesale Ltd.",
    ingredientCount: 12,
    images: ["invoice3.jpg", "invoice3-2.jpg"],
  },
];

export type Invoice = {
  id: string;
  invoiceNumber: string;
  date: Date;
  price: number;
  supplier: string;
  ingredientCount: number;
  images: string[];
};

export default function Documents() {
  const [activeSection, setActiveSection] = useState('invoices');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const sections = [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'delivery-notes', label: 'Delivery Notes', icon: FileBox },
    { id: 'stocktakes', label: 'Stocktakes', icon: ClipboardCheck },
  ];

  function InvoiceCard({ invoice }: { invoice: Invoice }) {
    const activeImageIndex = activeImageIndexes[invoice.id] || 0;

    return (
      <Card 
        className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:bg-muted/50"
        onClick={() => setEditingInvoice(invoice)}
      >
        <CardHeader className="relative pb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold">{invoice.invoiceNumber}</CardTitle>
            </div>
            <Badge variant="secondary" className="w-fit">
              {invoice.supplier}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {invoice.date.toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
              {/* Placeholder for images */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Images className="h-8 w-8" />
              </div>
              {invoice.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => setActiveImageIndexes(prev => ({
                      ...prev,
                      [invoice.id]: (activeImageIndex - 1 + invoice.images.length) % invoice.images.length
                    }))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setActiveImageIndexes(prev => ({
                      ...prev,
                      [invoice.id]: (activeImageIndex + 1) % invoice.images.length
                    }))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
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
    <div className="ml-64 w-full">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="px-8 mt-6 mb-6 flex items-center justify-end gap-4">
          {activeSection === 'invoices' && (
            <ViewToggle current={viewMode} onChange={setViewMode} />
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeSection === 'invoices' && (
            <>
              {viewMode === 'cards' ? (
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
                              <span className="text-sm text-gray-500">
                                {invoice.images.length}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {invoice.date.toLocaleDateString('en-US', { 
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
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

              <EditInvoiceSlider
                invoice={editingInvoice}
                open={editingInvoice !== null}
                onOpenChange={(open) => !open && setEditingInvoice(null)}
              />
            </>
          )}

          {activeSection === 'delivery-notes' && (
            <div className="p-6">
              <p className="text-gray-600">Delivery notes section coming soon...</p>
            </div>
          )}

          {activeSection === 'stocktakes' && (
            <div className="p-6">
              <p className="text-gray-600">Stocktakes section coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
