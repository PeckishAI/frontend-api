import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, FileBox, ClipboardCheck, Images, User2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { documentService } from "@/services/documentService";
import StocktakeSlider from "@/components/documents/StocktakeSlider";
import type { Invoices, Stocktake } from "@/lib/DocumentTypes";
import InvoicesComponent from "@/components/invoices/Invoices"; // Import the new Invoices component


export default function Documents() {
  const [activeSection, setActiveSection] = useState("invoices");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { currentRestaurant } = useRestaurantContext();

  const sections = [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "delivery-notes", label: "Delivery Notes", icon: FileBox },
    { id: "stocktakes", label: "Stocktakes", icon: ClipboardCheck },
  ];

  const { data: stocktakes = [], isLoading: isStocktakesLoading } = useQuery({
    queryKey: ["stocktakes", currentRestaurant?.restaurant_uuid],
    queryFn: async () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      const response = await documentService.getRestaurantStocktakes(currentRestaurant.restaurant_uuid);
      return response;
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

        <div className="px-8 mt-6 mb-6 flex items-center justify-end gap-4">
          {(activeSection === "invoices" || activeSection === "stocktakes") && (
            <ViewToggle current={viewMode} onChange={setViewMode} />
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeSection === "invoices" && <InvoicesComponent />}

          {activeSection === "delivery-notes" && (
            <div className="p-6">
              <p className="text-gray-600">Delivery notes section coming soon...</p>
            </div>
          )}

          {activeSection === "stocktakes" && (
            <>
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
                          {/* Assuming StocktakeCard component exists */}
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
                        <TableHead>Documents</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isStocktakesLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
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
                              <Badge>{stocktake.documents?.length || 0}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{stocktake.status || "Completed"}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              <StocktakeSlider
                stocktake={selectedStocktake}
                open={!!selectedStocktake}
                onOpenChange={(open) => !open && setSelectedStocktake(null)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}