import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        className="w-full border-l-0 p-0"
      >
        <div className="flex h-full">
          {/* Left side - Images */}
          <div className="w-1/2 border-r bg-gray-50 p-6">
            <div className="relative aspect-[3/2] bg-white rounded-lg overflow-hidden shadow-sm">
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

            {/* Thumbnails */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {invoice.images.map((_, index) => (
                <button
                  key={index}
                  className={`relative aspect-[3/2] w-20 rounded-md bg-white shadow-sm ${
                    index === activeImageIndex ? 'ring-2 ring-primary' : ''
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
          <div className="w-1/2 p-6">
            <h2 className="text-lg font-semibold mb-6">Edit Invoice</h2>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ingredientCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Ingredients</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
