import * as React from "react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreatableSelect } from "@/components/ui/creatable-select";
import type { Invoice } from "@/pages/Documents";

const defaultSuppliers = [
  { value: 'fresh_produce_co', label: 'Fresh Produce Co.' },
  { value: 'meat_suppliers_inc', label: 'Meat Suppliers Inc.' },
  { value: 'grocery_wholesale', label: 'Grocery Wholesale Ltd.' },
];

const defaultUnits = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (mL)' },
  { value: 'pcs', label: 'Pieces' },
  { value: 'box', label: 'Box' },
  { value: 'case', label: 'Case' },
];

const defaultIngredients = [
  { value: 'tomatoes', label: 'Tomatoes' },
  { value: 'lettuce', label: 'Lettuce' },
  { value: 'chicken_breast', label: 'Chicken Breast' },
  { value: 'olive_oil', label: 'Olive Oil' },
];

const extractedIngredientSchema = z.object({
  detected: z.string(),
  mapped: z.string(),
  unit: z.string(),
  quantity: z.number().min(0),
  unitCost: z.number().min(0),
  totalCost: z.number().min(0),
  vat: z.number().min(0),
});

type ExtractedIngredient = z.infer<typeof extractedIngredientSchema>;

const editInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  supplier: z.string().min(1, "Supplier is required"),
  date: z.date(),
  ingredients: z.array(extractedIngredientSchema).min(1, "At least one ingredient is required"),
  price: z.number().min(0).optional(),
});

type EditInvoiceFormValues = z.infer<typeof editInvoiceSchema>;

interface EditInvoiceSliderProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInvoiceSlider({ invoice, open, onOpenChange }: EditInvoiceSliderProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const calculateTotal = () => {
    const ingredients = form.watch("ingredients");
    return ingredients.reduce((sum, ingredient) => sum + (ingredient.totalCost || 0), 0);
  };
  
  const form = useForm<EditInvoiceFormValues>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      supplier: "",
      date: new Date(),
      ingredients: [{
        detected: "",
        mapped: "",
        unit: "",
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        vat: 0,
      }],
      price: 0,
    },
  });

  React.useEffect(() => {
    if (invoice) {
      form.reset({
        invoiceNumber: invoice.invoiceNumber,
        supplier: invoice.supplier,
        date: invoice.date,
        ingredients: invoice?.ingredients || [],
        price: invoice?.price || 0,
      });
    }
  }, [invoice, form]);

  const onSubmit = (data: EditInvoiceFormValues) => {
    console.log(data);
    onOpenChange(false);
  };

  const addIngredient = () => {
    const currentIngredients = form.getValues("ingredients") || [];
    form.setValue("ingredients", [
      ...currentIngredients,
      {
        detected: "",
        mapped: "",
        unit: "",
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        vat: 0,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("ingredients");
    form.setValue(
      "ingredients",
      currentIngredients.filter((_, i) => i !== index)
    );
  };

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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                <div className="border-b">
                  <div className="p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    >
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Invoice Details
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isDetailsOpen ? "transform rotate-180" : "")} />
                      </h2>
                    </div>

                    <div className={cn("space-y-8 overflow-hidden transition-all mt-6", 
                      isDetailsOpen ? "opacity-100" : "h-0 opacity-0")}>
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="invoiceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Invoice Number</FormLabel>
                              <FormControl>
                                <Input {...field} className="font-mono" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                              <CreatableSelect
                                value={field.value ? [field.value] : []}
                                onChange={(values) => {
                                  if (values[0]) {
                                    field.onChange(values[0]);
                                  }
                                }}
                                options={defaultSuppliers}
                                onCreateOption={(value) => {
                                  field.onChange(value);
                                }}
                                placeholder="Select or add supplier"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="col-span-2 flex items-center gap-4 justify-end border-t pt-4">
                        <div className="text-sm flex items-center gap-2">
                          <span className="text-muted-foreground">Extracted Total:</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={form.watch("price")}
                            onChange={(e) => {
                              form.setValue("price", parseFloat(e.target.value));
                            }}
                            className="w-32"
                          />
                        </div>
                        <div className="text-sm flex items-center gap-2">
                          <span className="text-muted-foreground">Calculated Total:</span>
                          <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Extracted Ingredients</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIngredient}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>

                  {form.watch("ingredients").map((ingredient, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.detected`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                Detected
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.mapped`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                Mapped Ingredient
                              </FormLabel>
                              <FormControl>
                                <CreatableSelect
                                  value={field.value ? [field.value] : []}
                                  onChange={(values) => {
                                    if (values[0]) {
                                      field.onChange(values[0]);
                                    }
                                  }}
                                  options={defaultIngredients}
                                  onCreateOption={(value) => {
                                    field.onChange(value);
                                  }}
                                  placeholder="Select or add ingredient"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  Quantity
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.unit`}
                            render={({ field }) => (
                              <FormItem className="w-32">
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  Unit
                                </FormLabel>
                                <FormControl>
                                  <CreatableSelect
                                    value={field.value ? [field.value] : []}
                                    onChange={(values) => {
                                      if (values[0]) {
                                        field.onChange(values[0]);
                                      }
                                    }}
                                    options={defaultUnits}
                                    onCreateOption={(value) => {
                                      field.onChange(value);
                                    }}
                                    placeholder="Unit"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.unitCost`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  Unit Cost
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    placeholder="Unit Cost"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.vat`}
                            render={({ field }) => (
                              <FormItem className="w-24">
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  VAT %
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    placeholder="VAT %"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-8"
                            onClick={() => removeIngredient(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto p-8 bg-gray-50 border-t">
                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save changes</Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}