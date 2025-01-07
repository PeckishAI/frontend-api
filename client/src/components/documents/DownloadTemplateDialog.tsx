import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DownloadTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DownloadTemplateDialog({
  open,
  onOpenChange,
}: DownloadTemplateDialogProps) {
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
            onClick={() => {
              // Download logic will be implemented later
              onOpenChange(false);
            }}
          >
            Download Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
