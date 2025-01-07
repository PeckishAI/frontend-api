import { Hash, User2, Images, DollarSign, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  Unit,
  Stocktake,
  StocktakeDocument,
  StocktakeIngredient,
} from "@/lib/DocumentTypes";

interface StocktakeCardProps {
  stocktake: Stocktake;
}

export function StocktakeCard({ stocktake }: StocktakeCardProps) {
  const firstImage = stocktake.documents.find(d => d.document_type === 'image');
  const firstVideo = stocktake.documents.find(d => d.document_type === 'video');
  const firstDoc = firstImage || firstVideo;
  console.log('First document:', firstDoc);

  return (
    <Card className="group cursor-pointer hover:bg-muted/50">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{stocktake.stocktake_uuid}</span>
            </div>
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {stocktake.created_by?.name || 'Unknown user'}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(stocktake.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-muted-foreground">Documents:</span>
              <Badge variant="secondary">{stocktake.documents.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-gray-600" />
              <Badge variant="secondary">
                {stocktake.documents.filter(d => d.document_type === 'video').length}
              </Badge>
            </div>
          </div>
          <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
            {firstDoc ? (
              <>
                {firstDoc.document_type === 'video' ? (
                  <>
                    <video
                      src={firstDoc.file_path}
                      className="absolute inset-0 w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                      onLoadedMetadata={(e) => {
                        const video = e.target as HTMLVideoElement;
                        // Set time to 0.1 seconds to get first frame quickly
                        video.currentTime = 0.1;
                      }}
                      onLoadedData={(e) => {
                        const video = e.target as HTMLVideoElement;
                        // Ensure frame is captured
                        video.pause();
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Film className="h-8 w-8 text-white" />
                    </div>
                  </>
                ) : (
                  <img 
                    src={firstDoc.file_path}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Images className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}