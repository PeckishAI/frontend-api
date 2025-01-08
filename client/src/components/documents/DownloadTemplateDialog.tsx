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

interface DownloadTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DownloadTemplateDialog({
  open,
  onOpenChange,
}: DownloadTemplateDialogProps) {
  const { currentRestaurant } = useRestaurantContext();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Stocktake Template</DialogTitle>
        </DialogHeader>
        <div className="py-6">
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                if (!currentRestaurant?.restaurant_uuid) {
                  throw new Error("No restaurant selected");
                }

                const inventory =
                  await inventoryService.getRestaurantIngredients(
                    currentRestaurant.restaurant_uuid,
                  );

                // Prepare CSV data
                console.log(inventory);
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
              }
            }}
          >
            Download Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
