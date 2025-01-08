
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadStocktakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadStocktakeDialog({
  open,
  onOpenChange,
}: UploadStocktakeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Stocktake File</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Please ensure your stocktake file meets the following requirements:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>File must be in CSV format</li>
              <li>Each row should contain: Item Name, Quantity, Unit</li>
              <li>Use the template provided in the download section</li>
              <li>Quantities should be positive numbers</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>

          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file && file.name.endsWith('.csv')) {
                // Upload logic will be implemented later
                onOpenChange(false);
              }
            }}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input 
              type="file" 
              accept=".csv"
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.name.endsWith('.csv')) {
                  // Upload logic will be implemented later
                  onOpenChange(false);
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
