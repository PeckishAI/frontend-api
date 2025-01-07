
import { Hash, User2, Images, DollarSign, Package2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Invoices } from "@/lib/DocumentTypes";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { useState } from "react";

interface InvoiceCardProps {
  invoice: Invoices;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    console.log("Deleting invoice:", invoice.document_uuid);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3 relative">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg font-semibold">
                  {invoice.invoice_number}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {invoice.supplier?.supplier_name || "Unknown Supplier"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {invoice.date
                ? new Date(invoice.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
              {invoice.documents?.[0]?.name ? (
                <img
                  src={`https://storage.cloud.google.com/peckish-datasets/restaurant/${invoice.documents[0].name}`}
                  alt={invoice.invoice_number}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Images className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="font-medium">
                  {useRestaurantContext().currencyInfo?.currencySymbol}
                  {invoice.amount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-gray-600" />
                <span className="font-medium">
                  {invoice.ingredients?.length || 0}
                </span>
                <span className="text-sm text-gray-500">items</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
