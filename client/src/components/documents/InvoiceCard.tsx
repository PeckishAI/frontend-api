
import { Hash, User2, Images, DollarSign, Package2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  price: number;
  supplier: string;
  ingredientCount: number;
  images: string[];
}

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Card className="group cursor-pointer hover:bg-muted/50">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {invoice.supplier}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {invoice.date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-muted-foreground">Images:</span>
              <Badge variant="secondary">{invoice.images.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Package2 className="h-4 w-4 text-gray-600" />
              <Badge variant="secondary">{invoice.ingredientCount}</Badge>
            </div>
          </div>
          <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
            {invoice.images[0] ? (
              <img 
                src={invoice.images[0]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Images className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">${invoice.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
