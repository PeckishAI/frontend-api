import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, DollarSign, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { type Invoice } from "@/pages/Documents";

interface EditInvoiceSliderProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInvoiceSlider({ invoice, open, onOpenChange }: EditInvoiceSliderProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const form = useForm({
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || "",
      supplier: invoice?.supplier || "",
      price: invoice?.price || 0,
      ingredientCount: invoice?.ingredientCount || 0,
    },
  });

  if (!invoice) return null;

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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-400">Image {activeImageIndex + 1}</div>
              </div>

              {/* Image navigation */}
              {invoice.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => setActiveImageIndex(prev => 
                      (prev - 1 + invoice.images.length) % invoice.images.length
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setActiveImageIndex(prev => 
                      (prev + 1) % invoice.images.length
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Image count indicator */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              Image {activeImageIndex + 1} of {invoice.images.length}
            </div>
            {/* Thumbnails */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {invoice.images.map((_, index) => (
                <button
                  key={index}
                  className={`relative aspect-[3/2] w-20 rounded-md bg-white shadow-sm transition-all ${
                    index === activeImageIndex ? 'ring-2 ring-primary scale-95' : 'hover:scale-105'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-1/2 bg-white">
            <div className="p-8 border-b">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Invoice Details</h2>
                <div className="text-sm text-muted-foreground">
                  {invoice.date.toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <Form {...form}>
                <div className="space-y-8">
                  {/* Invoice Header Section */}
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-muted-foreground">Invoice Number</FormLabel>
                          <FormControl>
                            <Input {...field} className="font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-muted-foreground">Supplier</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Form>
            </div>

            {/* Summary Section */}
            <div className="p-8 bg-gray-50/50 border-b">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-8">
                {/* Price Card */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-2xl font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Ingredients Card */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-muted-foreground">Ingredients</div>
                    <Package2 className="h-4 w-4 text-gray-500" />
                  </div>
                  <FormField
                    control={form.control}
                    name="ingredientCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            className="text-2xl font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                            placeholder="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
