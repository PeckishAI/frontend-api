import { useState } from "react";
import ViewToggle from "@/components/orders/ViewToggle";
import StocktakesView from "@/components/documents/StocktakesView";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

export default function Stocktakes() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  return (
    <div className="px-8 pt-8 space-y-6">
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Upload className="h-4 w-4" />
        </Button>
        <ViewToggle current={viewMode} onChange={setViewMode} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <StocktakesView viewMode={viewMode} />
      </div>
    </div>
  );
}