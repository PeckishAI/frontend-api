
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
            Download our stocktake template file to get started. This CSV template includes the required columns and format for importing your stocktake data.
          </p>
          <ul className="list-disc list-inside mt-4 text-sm text-muted-foreground">
            <li>Fill in the quantities for each item</li>
            <li>Make sure to use the units we already provided</li>
            <li>Save the file in CSV format</li>
            <li>Upload the CSV file on this page</li>
          </ul>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              Note: The template follows a standard CSV format with columns for Item Code, Item Name, Quantity, and Unit. Please do not modify the column headers or structure of the template file.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            // Download logic will be implemented later
            onOpenChange(false);
          }}>
            Download Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
