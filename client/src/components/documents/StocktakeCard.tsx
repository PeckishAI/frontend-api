import { Hash, User2, Images, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Document = {
  type: 'image' | 'video';
  url: string;
};

export type Stocktake = {
  id: string;
  date: Date;
  user: {
    name: string;
    avatar?: string;
  };
  documents: Document[];
};

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
              <span className="font-medium">{stocktake.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{stocktake.user.name}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {stocktake.date.toLocaleDateString('en-US', { 
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-muted-foreground">Total Documents:</span>
              <Badge variant="secondary">
                {stocktake.documents.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">$1,234.56</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
