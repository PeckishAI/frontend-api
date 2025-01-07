
import { useState } from "react";
import ViewToggle from "@/components/orders/ViewToggle";
import StocktakesView from "@/components/documents/StocktakesView";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import DownloadTemplateDialog from "@/components/documents/DownloadTemplateDialog";
import UploadStocktakeDialog from "@/components/documents/UploadStocktakeDialog";

export default function Stocktakes() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-end gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setShowDownloadDialog(true)}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="h-4 w-4" />
        </Button>
        <ViewToggle current={viewMode} onChange={setViewMode} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <StocktakesView 
          viewMode={viewMode} 
          showDownloadDialog={showDownloadDialog}
          setShowDownloadDialog={setShowDownloadDialog}
          showUploadDialog={showUploadDialog}
          setShowUploadDialog={setShowUploadDialog}
        />
      </div>
      
      <DownloadTemplateDialog 
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
      />
      
      <UploadStocktakeDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog} 
      />
    </div>
  );
}
