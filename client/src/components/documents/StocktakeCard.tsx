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
                {stocktake.created_by.name}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {stocktake.created_at.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-muted-foreground">
                Total Documents:
              </span>
              <Badge variant="secondary">{stocktake.documents.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">$1,234.56</span>
            </div>
          </div>
          <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
            {stocktake.documents[0]?.document_type === 'video' ? (
              <>
                <video
                  src={stocktake.documents[0]?.file_path}
                  className="absolute inset-0 w-full h-full object-cover"
                  onLoadedData={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.currentTime = 1; // Seek to 1 second for thumbnail
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
        </div>
      </CardContent>
    </Card>
  );
}