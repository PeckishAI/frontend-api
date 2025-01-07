
import { useState } from "react";
import { FileText, FileBox, ClipboardCheck, Download, Upload } from "lucide-react";
import ViewToggle from "@/components/orders/ViewToggle";
import SubSectionNav from "@/components/layout/SubSectionNav";
import InvoicesView from "@/components/documents/InvoicesView";
import StocktakesView from "@/components/documents/StocktakesView";
import Stocktakes from "./documents/Stocktakes";
import DownloadTemplateDialog from "@/components/documents/DownloadTemplateDialog";
import UploadStocktakeDialog from "@/components/documents/UploadStocktakeDialog";
import { Button } from "@/components/ui/button";

export default function Documents() {
  const [activeSection, setActiveSection] = useState("invoices");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const sections = [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "delivery-notes", label: "Delivery Notes", icon: FileBox },
    { id: "stocktakes", label: "Stocktakes", icon: ClipboardCheck },
  ];

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
            <>
              <ViewToggle current={viewMode} onChange={setViewMode} />
              {activeSection === "stocktakes" && (
                <>
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
                </>
              )}
            </>
          )}
        </div>

        <div className="px-8 pb-8">
          {activeSection === "invoices" && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <InvoicesView viewMode={viewMode} />
            </div>
          )}
          
          {activeSection === "delivery-notes" && (
            <div className="bg-white rounded-lg shadow overflow-hidden p-6">
              <p className="text-gray-600">Delivery notes section coming soon...</p>
            </div>
          )}
          
          {activeSection === "stocktakes" && <Stocktakes viewMode={viewMode} />}
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
    </div>
  );
}
