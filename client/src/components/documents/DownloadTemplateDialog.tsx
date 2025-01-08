
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { inventoryService } from "@/services/inventoryService";
import { useQuery } from "@tanstack/react-query";
import { tagService } from "@/services/tagService";
import { supplierService } from "@/services/supplierService";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DownloadTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DownloadTemplateDialog({
  open,
  onOpenChange,
}: DownloadTemplateDialogProps) {
  const { currentRestaurant } = useRestaurantContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<"tags" | "suppliers" | null>(null);

  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ["tags", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return tagService.getRestaurantTags(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return supplierService.getRestaurantSuppliers(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Stocktake Template</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Download our stocktake template file to get started. This CSV
            template includes the required columns and format for importing your
            stocktake data.
          </p>
          <ul className="list-disc list-inside mt-4 text-sm text-muted-foreground">
            <li>Fill in the quantities for each item</li>
            <li>Make sure to use the units we already provided</li>
            <li>Save the file in CSV format</li>
            <li>Upload the CSV file on this page</li>
          </ul>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              Note: Changing the units of an item from the one we provided will
              affect the tracking of this item since we won't be able to know
              how to add it to the stock.
            </p>
          </div>
          <div className="mt-6 space-y-4 max-h-[200px] overflow-y-auto pr-2">
            {tagsLoading || suppliersLoading ? (
              <div className="space-y-4">
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-2 sticky top-0 bg-background z-10 pb-2">
                  <Button 
                    variant={activeFilter === "tags" ? "default" : "outline"}
                    onClick={() => setActiveFilter(activeFilter === "tags" ? null : "tags")}
                  >
                    Tags
                  </Button>
                  <Button
                    variant={activeFilter === "suppliers" ? "default" : "outline"}
                    onClick={() => setActiveFilter(activeFilter === "suppliers" ? null : "suppliers")}
                  >
                    Suppliers
                  </Button>
                </div>

                {activeFilter === "tags" && (
                  <ToggleGroup 
                    type="multiple" 
                    value={selectedTags} 
                    onValueChange={setSelectedTags}
                    className="flex flex-col w-full gap-1"
                  >
                    {(tags?.data || []).map((tag: any) => (
                      <ToggleGroupItem key={tag.tag_uuid} value={tag.tag_uuid} className="w-full px-3 py-2 justify-start">
                        {tag.tag_name}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}

                {activeFilter === "suppliers" && (
                  <ToggleGroup 
                    type="multiple" 
                    value={selectedSuppliers} 
                    onValueChange={setSelectedSuppliers}
                    className="flex flex-col w-full gap-1"
                  >
                    {(suppliers || []).map((supplier: any) => (
                      <ToggleGroupItem key={supplier.supplier_uuid} value={supplier.supplier_uuid} className="w-full px-3 py-2 justify-start">
                        {supplier.supplier_name}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setIsDownloading(true);
              try {
                if (!currentRestaurant?.restaurant_uuid) {
                  throw new Error("No restaurant selected");
                }

                const inventory = await inventoryService.getRestaurantIngredients(
                  currentRestaurant.restaurant_uuid,
                  selectedTags,
                  selectedSuppliers,
                );

                // Prepare CSV data
                const csvData = [
                  [
                    "ingredient_uuid",
                    "ingredient_name",
                    "quantity",
                    "unit_name",
                    "unit_uuid",
                  ],
                  ...Object.values(inventory).map((item: any) => [
                    item.ingredient_uuid,
                    item.ingredient_name,
                    "", // Empty quantity for user to fill
                    item.base_unit?.unit_name || "",
                    item.base_unit?.unit_uuid || "",
                  ]),
                ];

                // Convert to CSV string
                const csvString = csvData
                  .map((row) => row.join(","))
                  .join("\n");

                // Create blob and download
                const blob = new Blob([csvString], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `stocktake-template-${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                onOpenChange(false);
              } catch (error) {
                console.error("Failed to download template:", error);
              } finally {
                setIsDownloading(false);
              }
            }}
            className="relative"
            disabled={isDownloading}
          >
            <span className="flex items-center gap-2">
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Downloading...
                </>
              ) : (
                "Download Template"
              )}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
