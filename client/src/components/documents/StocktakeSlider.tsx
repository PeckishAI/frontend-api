
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { documentService } from "@/services/documentService";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Hash, User2, Film, Images, CalendarDays, DollarSign } from "lucide-react";
import type { Stocktake } from "@/lib/DocumentTypes";

interface StocktakeSliderProps {
  stocktake: Stocktake | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StocktakeSlider({ stocktake, open, onOpenChange }: StocktakeSliderProps) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(-1);
  const { currentRestaurant } = useRestaurantContext();
  
  const { data: stocktakeDetail } = useQuery({
    queryKey: ["stocktake-detail", currentRestaurant?.restaurant_uuid, stocktake?.stocktake_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid || !stocktake?.stocktake_uuid) {
        throw new Error("Missing required data");
      }
      return documentService.getRestaurantStocktake(
        currentRestaurant.restaurant_uuid,
        stocktake.stocktake_uuid
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid && !!stocktake?.stocktake_uuid && open,
  });
  
  if (!stocktake) return null;

  const ingredients = stocktakeDetail?.ingredients || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none h-screen p-0 border-0"
      >
        <div className="flex h-full divide-x divide-border">
          {/* Left side - Images */}
          <div className="w-1/2 bg-gray-50/50 p-6">
            <div className="relative aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
              {/* Media display */}
              {selectedDocIndex === -1 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Images className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-sm">Select a document to preview</span>
                  </div>
                </div>
              ) : stocktake.documents[selectedDocIndex]?.document_type === 'video' ? (
                <video 
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                  controls
                  src={stocktake.documents[selectedDocIndex].file_path}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <img 
                  src={stocktake.documents[selectedDocIndex].file_path}
                  alt="Stocktake document"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}

              {/* Image count indicator */}
              {selectedDocIndex !== -1 && (
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  Document {selectedDocIndex + 1} of {stocktake.documents.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {stocktake.documents.map((doc, index) => (
                <button
                  key={doc.document_uuid}
                  onClick={() => setSelectedDocIndex(index)}
                  className={`relative aspect-[3/2] w-20 rounded-md bg-white shadow-sm transition-all overflow-hidden ${
                    index === selectedDocIndex 
                      ? 'ring-2 ring-primary scale-95' 
                      : 'hover:scale-105'
                  }`}
                >
                  {doc.document_type === 'video' ? (
                    <>
                      <video 
                        src={doc.file_path}
                        className="absolute inset-0 w-full h-full object-cover"
                        onLoadedData={(e) => {
                          const video = e.target as HTMLVideoElement;
                          video.currentTime = 1; // Seek to 1 second to get a representative frame
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Film className="h-4 w-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <img 
                        src={doc.file_path}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Images className="h-4 w-4 text-white" />
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-1/2 bg-white flex flex-col h-full">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-6 mb-6">
                {/* ID at the top */}
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-medium">{stocktake.stocktake_uuid}</span>
                </div>

                {/* User and Date on the same line */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4" />
                    <span>{stocktake.created_by.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {stocktake.created_at.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Inventory Items</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDocIndex(-1)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedDocIndex === -1
                          ? 'bg-primary text-primary-foreground shadow-md scale-105'
                          : 'bg-secondary hover:bg-secondary/80 hover:shadow hover:scale-105'
                      }`}
                    >
                      Show All
                    </button>
                    {stocktake.documents.map((doc, index) => (
                      <button
                        key={doc.document_uuid}
                        onClick={() => setSelectedDocIndex(index)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                          index === selectedDocIndex
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-secondary hover:bg-secondary/80 hover:shadow hover:scale-105'
                        }`}
                      >
                        {doc.document_type === 'video' ? (
                          <Film className="h-3.5 w-3.5" />
                        ) : (
                          <Images className="h-3.5 w-3.5" />
                        )}
                        Doc {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedDocIndex === -1 
                    ? `Total of ${ingredients.length} items recorded`
                    : `${ingredients.filter(ingredient => 
                        ingredient.document_uuid === stocktake.documents[selectedDocIndex]?.document_uuid
                      ).length} items in document ${selectedDocIndex + 1}`
                  }
                </p>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients
                      .filter(ingredient => {
                        if (selectedDocIndex === -1) {
                          console.log('All Documents View:', {
                            ingredientName: ingredient.ingredient_name,
                            ingredientUuid: ingredient.ingredient_uuid,
                            documentUuid: ingredient.document_uuid
                          });
                          return true;
                        }
                        const selectedDoc = stocktake.documents[selectedDocIndex];
                        console.log('Document Filter:', {
                          selectedDocIndex,
                          selectedDocUuid: selectedDoc?.document_uuid,
                          ingredient: {
                            name: ingredient.ingredient_name,
                            uuid: ingredient.ingredient_uuid,
                            documentUuid: ingredient.document_uuid
                          },
                          isMatch: ingredient.document_uuid === selectedDoc?.document_uuid
                        });
                        return selectedDoc && ingredient.document_uuid === selectedDoc.document_uuid;
                      })
                      .map((ingredient) => (
                        <TableRow key={`${ingredient.ingredient_uuid}-${ingredient.document_uuid}`}>
                          <TableCell>{ingredient.ingredient_name}</TableCell>
                          <TableCell className="text-right">{ingredient.quantity}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{ingredient.unit.unit_name}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {new Date(ingredient.created_at).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
