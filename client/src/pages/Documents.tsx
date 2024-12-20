
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, FileBox, ClipboardCheck, Images, User2, Hash, Film } from "lucide-react";
import ViewToggle from "@/components/orders/ViewToggle";
import SubSectionNav from "@/components/layout/SubSectionNav";
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
import { Badge } from "@/components/ui/badge";
import { EditInvoiceSlider } from "@/components/documents/EditInvoiceSlider";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { documentService } from "@/services/documentService";
import { InvoiceCard } from "@/components/documents/InvoiceCard";
import StocktakeSlider from "@/components/documents/StocktakeSlider";
import type { Invoices, Stocktake } from "@/lib/DocumentTypes";

function StocktakeCard({ stocktake }: { stocktake: Stocktake }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">
              {stocktake.stocktake_uuid}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {stocktake.created_by || "System User"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(stocktake.created_at || "").toLocaleDateString("en-US", {
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
            {stocktake.documents?.[0]?.document_type === 'video' ? (
              <>
                <video
                  src={stocktake.documents[0]?.file_path}
                  className="absolute inset-0 w-full h-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.currentTime = 0.1;
                  }}
                  onLoadedData={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.pause();
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Film className="h-8 w-8 text-white" />
                </div>
              </>
            ) : stocktake.documents?.[0]?.document_type === 'image' ? (
              <img 
                src={stocktake.documents[0]?.file_path}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Images className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-gray-600" />
              <span className="font-medium">
                {stocktake.documents?.filter((d) => d.document_type === "image").length || 0}
              </span>
              <span className="text-sm text-gray-500">images</span>
            </div>
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-gray-600" />
              <span className="font-medium">
                {stocktake.documents?.filter((d) => d.document_type === "video").length || 0}
              </span>
              <span className="text-sm text-gray-500">videos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Documents() {
  const [activeSection, setActiveSection] = useState("invoices");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editingInvoice, setEditingInvoice] = useState<Invoices | null>(null);
  const [selectedStocktake, setSelectedStocktake] = useState<Stocktake | null>(null);
  const { currentRestaurant } = useRestaurantContext();

  const sections = [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "delivery-notes", label: "Delivery Notes", icon: FileBox },
    { id: "stocktakes", label: "Stocktakes", icon: ClipboardCheck },
  ];

  const { data: invoices = [], isLoading: isInvoicesLoading } = useQuery({
    queryKey: ["invoices", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return documentService.getRestaurantInvoices(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid && activeSection === "invoices",
  });

  const { data: stocktakes = [], isLoading: isStocktakesLoading } = useQuery({
    queryKey: ["stocktakes", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return documentService.getRestaurantStocktakes(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid && activeSection === "stocktakes",
  });

  return (
    <div className="ml-64 w-[calc(100%-16rem)]">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="px-8 mb-6 flex items-center justify-end gap-4">
          {(activeSection === "invoices" || activeSection === "stocktakes") && (
            <ViewToggle current={viewMode} onChange={setViewMode} />
          )}
        </div>

        <div className="px-8 pb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {activeSection === "invoices" && (
              <div className="p-6">
                {viewMode === "cards" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isInvoicesLoading ? (
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
                      {isInvoicesLoading ? (
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
                              <Badge variant="secondary">
                                {invoice.supplier?.[0]?.supplier_name || "-"}
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
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}

            {activeSection === "delivery-notes" && (
              <div className="p-6">
                <p className="text-gray-600">Delivery notes section coming soon...</p>
              </div>
            )}

            {activeSection === "stocktakes" && (
              <div className="p-6">
                {viewMode === "cards" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isStocktakesLoading ? (
                      <div className="col-span-3 text-center py-8">
                        Loading stocktakes...
                      </div>
                    ) : (
                      stocktakes.map((stocktake) => (
                        <div
                          key={stocktake.stocktake_uuid}
                          onClick={() => setSelectedStocktake(stocktake)}
                          className="cursor-pointer"
                        >
                          <StocktakeCard stocktake={stocktake} />
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Images</TableHead>
                        <TableHead>Videos</TableHead>
                        <TableHead>Total Documents</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isStocktakesLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading stocktakes...
                          </TableCell>
                        </TableRow>
                      ) : (
                        stocktakes.map((stocktake) => (
                          <TableRow
                            key={stocktake.stocktake_uuid}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedStocktake(stocktake)}
                          >
                            <TableCell>{stocktake.stocktake_uuid}</TableCell>
                            <TableCell>
                              {stocktake.created_at ? new Date(stocktake.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }) : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User2 className="h-4 w-4 text-gray-500" />
                                <span>{stocktake.created_by || "System User"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {stocktake.documents?.filter((d) => d.document_type === "image").length || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {stocktake.documents?.filter((d) => d.document_type === "video").length || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge>{stocktake.documents?.length || 0}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </div>
        </div>

        <EditInvoiceSlider
          invoice={editingInvoice}
          open={!!editingInvoice}
          onOpenChange={(open) => !open && setEditingInvoice(null)}
        />

        <StocktakeSlider
          stocktake={selectedStocktake}
          open={!!selectedStocktake}
          onOpenChange={(open) => !open && setSelectedStocktake(null)}
        />
      </div>
    </div>
  );
}
