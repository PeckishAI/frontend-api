import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, FileBox, ClipboardCheck, Images, User2, Hash, Film } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { documentService } from "@/services/documentService";
import StocktakeSlider from "./StocktakeSlider";
import DownloadTemplateDialog from "./DownloadTemplateDialog";
import UploadStocktakeDialog from "./UploadStocktakeDialog";
import type { Stocktake } from "@/lib/DocumentTypes";

function StocktakeCard({ stocktake }: { stocktake: Stocktake }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">
              {stocktake.stocktake_uuid}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {stocktake.created_by.name}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(stocktake.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
            {stocktake.documents[0]?.document_type === 'video' ? (
              <>
                <video
                  src={stocktake.documents[0]?.file_path}
                  className="absolute inset-0 w-full h-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.currentTime = 0.1;
                  }}
                  onLoadedData={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.pause();
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Film className="h-8 w-8 text-white" />
                </div>
              </>
            ) : stocktake.documents[0]?.document_type === 'image' ? (
              <img 
                src={stocktake.documents[0]?.file_path}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Images className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-gray-600" />
              <span className="font-medium">
                {stocktake.documents.filter((d) => d.document_type === "image").length}
              </span>
              <span className="text-sm text-gray-500">images</span>
            </div>
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-gray-600" />
              <span className="font-medium">
                {stocktake.documents.filter((d) => d.document_type === "video").length}
              </span>
              <span className="text-sm text-gray-500">videos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StocktakesViewProps {
  viewMode: "cards" | "table";
  showDownloadDialog: boolean;
  setShowDownloadDialog: (show: boolean) => void;
  showUploadDialog: boolean;
  setShowUploadDialog: (show: boolean) => void;
}

export default function StocktakesView({ viewMode }: StocktakesViewProps) {
  const [selectedStocktake, setSelectedStocktake] = useState<Stocktake | null>(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { currentRestaurant } = useRestaurantContext();

  const { data: stocktakes = [], isLoading } = useQuery({
    queryKey: ["stocktakes", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return documentService.getRestaurantStocktakes(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  return (
    <>
      <DownloadTemplateDialog 
        open={showDownloadDialog} 
        onOpenChange={setShowDownloadDialog}
      />

      <UploadStocktakeDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />

      {viewMode === "cards" ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 text-center py-8">Loading stocktakes...</div>
          ) : (
            stocktakes.map((stocktake) => (
              <div
                key={stocktake.stocktake_uuid}
                onClick={() => setSelectedStocktake(stocktake)}
                className="cursor-pointer"
              >
                <StocktakeCard stocktake={stocktake} />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Videos</TableHead>
                <TableHead>Total Documents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
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
                      {new Date(stocktake.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User2 className="h-4 w-4 text-gray-500" />
                        <span>{stocktake.created_by.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {stocktake.documents.filter((d) => d.document_type === "image").length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {stocktake.documents.filter((d) => d.document_type === "video").length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{stocktakes.length}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <StocktakeSlider
        stocktake={selectedStocktake}
        open={!!selectedStocktake}
        onOpenChange={(open) => !open && setSelectedStocktake(null)}
      />
    </>
  );
}