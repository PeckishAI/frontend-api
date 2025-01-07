
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
