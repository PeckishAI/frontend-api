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
import { cn } from "@/lib/utils";
import styles from "./StocktakeSlider.module.css";
import { type Stocktake } from "./StocktakeCard";

interface StocktakeSliderProps {
  stocktake: Stocktake | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
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

export default function StocktakeSlider({ stocktake, open, onOpenChange, className }: StocktakeSliderProps) {
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
        className={cn(styles.sliderContainer, className)}
      >
        <div className={styles.contentContainer}>
          {/* Left side - Images */}
          <div className={styles.imageSection}>
            <div className={styles.imagePreview}>
              {/* Image display */}
              <div className={styles.emptyPreview}>
                {selectedDocIndex === -1 ? (
                  <div className={styles.emptyPreviewText}>
                    <Images className={styles.emptyPreviewIcon} />
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
                <div className={styles.imageCounter}>
                  Document {selectedDocIndex + 1} of {stocktake.documents.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className={styles.thumbnailsContainer}>
              {stocktake.documents.map((doc, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDocIndex(index)}
                  className={cn(
                    styles.thumbnailButton,
                    index === selectedDocIndex 
                      ? styles.thumbnailButtonActive
                      : styles.thumbnailButtonInactive
                  )}
                >
                  <div className={styles.thumbnailIcon}>
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
          <div className={styles.formSection}>
            <div className={styles.formContent}>
              <div className={styles.headerContent}>
                {/* ID at the top */}
                <div className={styles.idContainer}>
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <span className={styles.idText}>{stocktake.id}</span>
                </div>

                {/* User and Date on the same line */}
                <div className={styles.metaInfo}>
                  <div className={styles.metaItem}>
                    <User2 className={styles.metaIcon} />
                    <span>{stocktake.user.name}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <CalendarDays className={styles.metaIcon} />
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
                <div className={styles.valueContainer}>
                  <DollarSign className={styles.valueIcon} />
                  <div>
                    <span className={styles.valueText}>$1,234.56</span>
                    <span className={styles.valueLabel}>estimated value</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className={styles.inventoryHeader}>
                  <h3 className={styles.inventoryTitle}>Inventory Items</h3>
                  <div className={styles.documentButtons}>
                    <button
                      onClick={() => setSelectedDocIndex(-1)}
                      className={cn(
                        styles.documentButton,
                        selectedDocIndex === -1
                          ? styles.documentButtonActive
                          : styles.documentButtonInactive
                      )}
                    >
                      Show All
                    </button>
                    {stocktake.documents.map((doc, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDocIndex(index)}
                        className={cn(
                          styles.documentButton,
                          index === selectedDocIndex
                            ? styles.documentButtonActive
                            : styles.documentButtonInactive
                        )}
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
                <p className={styles.inventoryCount}>
                  {selectedDocIndex === -1 
                    ? `Total of ${Object.values(documentIngredients).flat().length} items recorded across all documents`
                    : `Total of ${(documentIngredients[selectedDocIndex] || []).length} items recorded in document ${selectedDocIndex + 1}`
                  }
                </p>
              </div>

              <div className={styles.tableContainer}>
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
