import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { Hash, User2, CalendarDays, DollarSign } from "lucide-react";
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
      <SheetContent className="w-[90vw] sm:max-w-[1200px] flex gap-8 overflow-y-auto">
        {/* Left side - Documents and Details */}
        <div className="flex-1">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">Stocktake Details</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Documents Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stocktake.documents.map((doc, index) => (
                <div key={index} className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    {doc.type === 'video' ? (
                      <Film className="h-8 w-8" />
                    ) : (
                      <Images className="h-8 w-8" />
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm truncate">{doc.url}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stocktake Information */}
            <div className="pt-6 border-t space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium">{stocktake.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <User2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg">{stocktake.user.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg">
                  {stocktake.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-medium">$1,234.56</span>
                <span className="text-sm text-muted-foreground">estimated value</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Ingredients table */}
        <div className="flex-[2]">
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
      </SheetContent>
    </Sheet>
  );
}
