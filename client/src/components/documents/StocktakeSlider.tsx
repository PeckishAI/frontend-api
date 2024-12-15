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
  if (!stocktake) return null;

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
                {stocktake.documents[0]?.type === 'video' ? (
                  <Film className="h-8 w-8" />
                ) : (
                  <Images className="h-8 w-8" />
                )}
              </div>

              {/* Image count indicator */}
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                Document 1 of {stocktake.documents.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {stocktake.documents.map((doc, index) => (
                <button
                  key={index}
                  className="relative aspect-[3/2] w-20 rounded-md bg-white shadow-sm transition-all hover:scale-105"
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
          <div className="w-1/2 bg-white">
            <div className="p-6">
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
                <h3 className="text-lg font-medium">Inventory Items</h3>
                <p className="text-sm text-muted-foreground">
                  Total of {mockIngredients.length} items recorded in this stocktake
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
                    {mockIngredients.map((ingredient) => (
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
