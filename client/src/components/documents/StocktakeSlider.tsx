import { useState } from "react";
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
import { type Stocktake } from "./StocktakeCard";

interface StocktakeSliderProps {
  stocktake: Stocktake | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

// Mock ingredients data - this would come from the backend in a real app
const mockIngredients: Ingredient[] = [
  { name: "Tomatoes", quantity: 5.5, unit: "kg" },
  { name: "Onions", quantity: 3, unit: "kg" },
  { name: "Chicken Breast", quantity: 10, unit: "kg" },
  { name: "Olive Oil", quantity: 2, unit: "L" },
  { name: "Salt", quantity: 500, unit: "g" },
];

export default function StocktakeSlider({ stocktake, open, onOpenChange }: StocktakeSliderProps) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(-1);
  
  if (!stocktake) return null;

  // Mock data for each document
  const documentIngredients: Record<number, Ingredient[]> = {
    0: mockIngredients,
    1: [
      { name: "Carrots", quantity: 2.5, unit: "kg" },
      { name: "Potatoes", quantity: 4, unit: "kg" },
    ],
    2: [
      { name: "Fish", quantity: 3, unit: "kg" },
      { name: "Lemon", quantity: 1, unit: "kg" },
      { name: "Herbs", quantity: 200, unit: "g" },
    ],
  };

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
              {/* Image display */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {selectedDocIndex === -1 ? (
                  <div className="text-center">
                    <Images className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-sm">Select a document to preview</span>
                  </div>
                ) : (
                  stocktake.documents[selectedDocIndex]?.type === 'video' ? (
                    <Film className="h-8 w-8" />
                  ) : (
                    <Images className="h-8 w-8" />
                  )
                )}
              </div>

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
                  key={index}
                  onClick={() => setSelectedDocIndex(index)}
                  className={`relative aspect-[3/2] w-20 rounded-md bg-white shadow-sm transition-all ${
                    index === selectedDocIndex 
                      ? 'ring-2 ring-primary scale-95' 
                      : 'hover:scale-105'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                    {doc.type === 'video' ? (
                      <Film className="h-4 w-4" />
                    ) : (
                      <Images className="h-4 w-4" />
                    )}
                  </div>
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
                  <span className="text-2xl font-medium">{stocktake.id}</span>
                </div>

                {/* User and Date on the same line */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4" />
                    <span>{stocktake.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {stocktake.date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Value at the bottom */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="text-lg font-medium">$1,234.56</span>
                    <span className="text-sm text-muted-foreground ml-2">estimated value</span>
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
                        key={index}
                        onClick={() => setSelectedDocIndex(index)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                          index === selectedDocIndex
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-secondary hover:bg-secondary/80 hover:shadow hover:scale-105'
                        }`}
                      >
                        {doc.type === 'video' ? (
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
                    ? `Total of ${Object.values(documentIngredients).flat().length} items recorded across all documents`
                    : `Total of ${(documentIngredients[selectedDocIndex] || []).length} items recorded in document ${selectedDocIndex + 1}`
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedDocIndex === -1 
                      ? Object.values(documentIngredients).flat()
                      : documentIngredients[selectedDocIndex] || []
                    ).map((ingredient) => (
                      <TableRow key={ingredient.name}>
                        <TableCell>{ingredient.name}</TableCell>
                        <TableCell className="text-right">{ingredient.quantity}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{ingredient.unit}</Badge>
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
