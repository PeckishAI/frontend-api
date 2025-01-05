import * as React from "react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreatableSelect } from "@/components/ui/creatable-select";
import type { Invoice } from "@/pages/Documents";
import { Slider } from "@/components/ui/slider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { supplierService } from "@/services/supplierService";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import { documentService } from "@/services/documentService";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";
import SupplierDialog from "@/components/suppliers/SupplierDialog";

const editInvoiceSchema = z.object({
  invoice_number: z.string().optional(),
  date: z.string().optional(),
  supplier: z
    .object({
      supplier_uuid: z.string().optional(),
      supplier_name: z.string().optional(),
    })
    .optional(),
  amount: z.number().optional(),
  vat: z.number().min(0).optional(),
  unit: z
    .object({
      unit_uuid: z.string(),
      unit_name: z.string(),
    })
    .optional(),
  discount: z.number().optional(),
  created_supplier: z.boolean().optional(),
  documents: z
    .array(
      z
        .object({
          document_uuid: z.string().optional(),
          file_path: z.string().optional(),
          name: z.string().optional(),
          document_type: z.string().optional(),
        })
        .optional(),
    )
    .optional()
    .default([]),
  invoice_ingredients: z
    .array(
      z.object({
        uuid: z.string().optional(),
        ingredient_uuid: z.string().optional(),
        ingredient_name: z.string().optional(),
        detected_name: z.string().optional(),
        quantity: z.number().optional(),
        unit_cost: z.number().min(0).optional(),
        total_cost: z.number().min(0).optional(),
        vat: z.number().min(0).optional(),
        unit: z
          .object({
            unit_uuid: z.string().optional().nullable(),
            unit_name: z.string().optional().nullable(),
          })
          .optional()
          .nullable(),
        document_uuid: z.string().optional(),
        product_code: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
});

type EditInvoiceFormValues = z.infer<typeof editInvoiceSchema>;

interface EditInvoiceSliderProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInvoiceSlider({
  invoice,
  open,
  onOpenChange,
}: EditInvoiceSliderProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [showSupplierDialog, setShowSupplierDialog] = useState(false); // Added state for supplier dialog
  const [newSupplierName, setNewSupplierName] = useState(""); // Added state for new supplier name
  const { currentRestaurant, currencyInfo } = useRestaurantContext();
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("Missing restaurant or supplier UUID");
      }
      return supplierService.getRestaurantSuppliers(
        currentRestaurant?.restaurant_uuid,
      );
    },
  });

  const { data: supplierIngredientUnits } = useQuery({
    queryKey: [
      "supplier-ingredient-units",
      currentRestaurant?.restaurant_uuid,
      invoice?.supplier?.supplier_uuid,
    ],
    queryFn: () => {
      if (
        !currentRestaurant?.restaurant_uuid ||
        !invoice?.supplier?.supplier_uuid
      ) {
        throw new Error("Missing restaurant or supplier UUID");
      }
      return unitService.getSupplierIngredientUnits(
        currentRestaurant.restaurant_uuid,
        invoice.supplier.supplier_uuid,
      );
    },
    enabled:
      !!currentRestaurant?.restaurant_uuid &&
      !!invoice?.supplier?.supplier_uuid,
  });

  const { data: restaurantIngredients } = useQuery({
    // Added restaurantIngredients query
    queryKey: ["ingredients", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return inventoryService.getRestaurantIngredients(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const { data: unitsData } = useQuery({
    //Added unitsData query
    queryKey: ["units", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return unitService.getRestaurantUnit(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const calculateTotalAmount = () => {
    const ingredients = form.watch("invoice_ingredients") || [];
    return ingredients.reduce(
      (sum, ingredient) => sum + (ingredient.total_cost || 0),
      0,
    );
  };

  const form = useForm<EditInvoiceFormValues>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: {
      invoice_number: "",
      date: "",
      amount: 0,
      invoice_ingredients: [],
      documents: [],
      supplier: invoice?.supplier || undefined,
    },
  });

  React.useEffect(() => {
    // Reset form with default values first
    form.reset({
      invoice_number: "",
      date: "",
      amount: 0,
      invoice_ingredients: [],
      documents: [],
      supplier: undefined,
    });

    // Then set new values if invoice exists
    if (invoice) {
      form.reset({
        invoice_number: invoice.invoice_number,
        supplier: invoice.supplier,
        date: invoice.date,
        invoice_ingredients: invoice?.ingredients || [],
        amount: invoice?.amount || 0,
        documents: invoice?.documents || [],
      });
    }
  }, [invoice, form]);

  const queryClient = useQueryClient();

  const onSubmit = async (data: EditInvoiceFormValues) => {
    if (!currentRestaurant?.restaurant_uuid || !invoice?.document_uuid) {
      console.error("Missing restaurant or invoice UUID");
      return;
    }

    if (Object.keys(form.formState.errors).length > 0) {
      console.error("Form validation errors:", form.formState.errors);
      return;
    }

    try {
      await documentService.updateInvoice(
        currentRestaurant.restaurant_uuid,
        invoice.document_uuid,
        data,
      );
      await queryClient.invalidateQueries([
        "invoices",
        currentRestaurant.restaurant_uuid,
      ]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update invoice:", error);
    }
  };

  const addIngredient = () => {
    const currentIngredients = form.getValues("invoice_ingredients") || [];
    form.setValue("invoice_ingredients", [
      ...currentIngredients,
      {
        detected_name: "",
        ingredient_name: "",
        quantity: 0,
        unit_cost: 0,
        total_cost: 0,
        vat: 0,
        discount: 0,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("invoice_ingredients") || [];
    const filteredIngredients = currentIngredients.filter(
      (_, i) => i !== index,
    );
    form.setValue("invoice_ingredients", filteredIngredients);
    calculateTotalAmount();
  };

  React.useEffect(() => {
    if (invoice?.ingredients) {
      const initializedIngredients = invoice.ingredients.map((ing) => ({
        ...ing,
        vat: ing.vat || 0,
      }));
      form.setValue("invoice_ingredients", initializedIngredients);
    }
  }, [invoice, form]);

  // Add validation error logging
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (Object.keys(form.formState.errors).length > 0) {
        console.log("Form validation errors:", form.formState.errors);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  if (!invoice) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none h-screen p-0 border-0 overflow-hidden"
      >
        <div className="flex h-full divide-x divide-border">
          {/* Left side - Images */}
          <div className="w-2/3 bg-gray-50/50 p-6">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
              {/* Image display */}
              {invoice.documents &&
              invoice.documents[activeImageIndex]?.name ? (
                <div className="relative w-full h-full">
                  <div className="absolute top-4 left-4 right-4 z-10 bg-white/90 p-2 rounded-lg shadow-sm">
                    <Slider
                      defaultValue={[100]}
                      min={50}
                      max={300}
                      step={10}
                      onValueChange={(value) => setZoom(value[0])}
                    />
                  </div>
                  <div className="relative w-full h-full overflow-auto">
                    <img
                      src={
                        "https://storage.cloud.google.com/peckish-datasets/restaurant/" +
                        invoice.documents[activeImageIndex].name
                      }
                      alt={`Invoice ${invoice.invoice_number} - Image ${activeImageIndex + 1}`}
                      className="w-full h-full object-contain transition-transform duration-200"
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "center",
                        cursor: "grab",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-400">No image available</div>
                </div>
              )}

              {/* Image navigation */}
              {invoice.documents && invoice.documents.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      setActiveImageIndex(
                        (prev) =>
                          (prev - 1 + invoice.documents.length) %
                          invoice.documents.length,
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      setActiveImageIndex(
                        (prev) => (prev + 1) % invoice.documents.length,
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Image count indicator */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              Image {activeImageIndex + 1} of {invoice.documents?.length || 0}
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {invoice.documents?.map((doc, index) => (
                <button
                  key={index}
                  className={`relative aspect-[3/2] w-20 rounded-md bg-white shadow-sm transition-all overflow-hidden ${
                    index === activeImageIndex
                      ? "ring-2 ring-primary scale-95"
                      : "hover:scale-105"
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  {doc.name ? (
                    <img
                      src={
                        "https://storage.cloud.google.com/peckish-datasets/restaurant/" +
                        doc.name
                      }
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                      {index + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-1/2 bg-white h-full overflow-y-auto">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="h-full flex flex-col"
              >
                <div className="border-b">
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Invoice Details
                    </h2>

                    <div
                      className={cn(
                        "space-y-8 overflow-hidden transition-all mt-6",
                        isDetailsOpen ? "opacity-100" : "h-0 opacity-0",
                      )}
                    >
                      <FormField
                        control={form.control}
                        name="supplier.supplier_name"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <CreatableSelect
                                  styles={{
                                    menu: (base) => ({
                                      ...base,
                                      position: "absolute",
                                      width: "100%",
                                      zIndex: 9999,
                                    }),
                                    container: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  }}
                                  menuPortalTarget={document.body}
                                  value={
                                    form.watch("supplier")?.supplier_uuid
                                      ? {
                                          value:
                                            form.watch("supplier")
                                              ?.supplier_uuid,
                                          label:
                                            form.watch("supplier")
                                              ?.supplier_name,
                                        }
                                      : null
                                  }
                                  onChange={(option) => {
                                    if (option) {
                                      form.setValue("supplier", {
                                        supplier_uuid: option.value,
                                        supplier_name: option.label,
                                      });

                                      const ingredients =
                                        form.getValues("ingredients") || [];
                                      ingredients.forEach((_, index) => {
                                        form.setValue(
                                          `ingredients.${index}.unit`,
                                          undefined,
                                        );
                                      });
                                    }
                                  }}
                                  options={suppliers?.map((supplier) => ({
                                    value: supplier.supplier_uuid,
                                    label: supplier.supplier_name,
                                  }))}
                                  onCreateOption={(inputValue) => {
                                    // Updated onCreateOption
                                    setNewSupplierName(inputValue);
                                    setShowSupplierDialog(true);
                                  }}
                                  placeholder=""
                                  size="large"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="invoice_number"
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
                                        !field.value && "text-muted-foreground",
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
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
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

                      <div className="col-span-2 flex items-center gap-4 justify-end border-t pt-4">
                        <div className="text-sm flex items-center gap-2">
                          <span className="text-muted-foreground">
                            Extracted Total:
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            value={form.watch("amount")}
                            onChange={(e) => {
                              form.setValue(
                                "amount",
                                parseFloat(e.target.value),
                              );
                            }}
                            className="w-32"
                          />
                        </div>
                        <div className="text-sm flex items-center gap-2">
                          <span className="text-muted-foreground">
                            Calculated Total:
                          </span>
                          <span className="font-medium">
                            {currencyInfo?.currencySymbol}
                            {calculateTotalAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-center p-2 cursor-pointer hover:bg-gray-50 border-t mt-4"
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isDetailsOpen ? "transform rotate-180" : "",
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Extracted Ingredients
                    </h3>
                  </div>

                  {(form.watch("invoice_ingredients") || []).map(
                    (ingredient, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`invoice_ingredients.${index}.detected_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Detected</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`invoice_ingredients.${index}.ingredient_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mapped Ingredient</FormLabel>
                                <FormControl>
                                  <CreatableSelect
                                    value={
                                      field.value
                                        ? {
                                            value:
                                              restaurantIngredients?.[
                                                field.value
                                              ]?.ingredient_uuid || "",
                                            label: field.value,
                                          }
                                        : null
                                    }
                                    onChange={(option) => {
                                      if (option) {
                                        field.onChange(option.label);
                                        form.setValue(
                                          `invoice_ingredients.${index}.ingredient_uuid`,
                                          option.value,
                                        );
                                      }
                                    }}
                                    options={Object.values(
                                      restaurantIngredients || {},
                                    ).map((ingredient) => ({
                                      value: ingredient.ingredient_uuid,
                                      label: ingredient.ingredient_name,
                                    }))}
                                    onCreateOption={(inputValue) => {
                                      setNewIngredientName(inputValue);
                                      setShowIngredientDialog(true);
                                    }}
                                    placeholder=""
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
                              name={`invoice_ingredients.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Quantity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value),
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`invoice_ingredients.${index}.unit`}
                              render={({ field }) => (
                                <FormItem className="w-32">
                                  <FormLabel>Unit</FormLabel>
                                  <FormControl>
                                    <CreatableSelect
                                      size="small"
                                      value={
                                        field.value
                                          ? {
                                              value: field.value.unit_uuid,
                                              label: field.value.unit_name,
                                            }
                                          : null
                                      }
                                      onChange={(option) => {
                                        if (option) {
                                          field.onChange({
                                            unit_uuid: option.value,
                                            unit_name: option.label,
                                          });
                                        }
                                      }}
                                      options={(() => {
                                        const selectedIngredientUuid =
                                          form.watch(
                                            `invoice_ingredients.${index}.ingredient_uuid`,
                                          );

                                        const groups = [];

                                        // Get associated units for the selected ingredient
                                        if (selectedIngredientUuid) {
                                          const associatedUnits =
                                            supplierIngredientUnits?.find(
                                              (item) =>
                                                item.ingredient_uuid ===
                                                selectedIngredientUuid,
                                            )?.units || [];

                                          if (associatedUnits.length > 0) {
                                            groups.push({
                                              label: "Associated Units",
                                              options: associatedUnits.map(
                                                (unit) => ({
                                                  value: unit.unit_uuid,
                                                  label: unit.unit_name,
                                                }),
                                              ),
                                            });
                                          }
                                        }

                                        // Add all other units
                                        const otherUnits =
                                          unitsData
                                            ?.filter((unit) => {
                                              // Exclude units that are already in associated units
                                              const associatedUnits =
                                                supplierIngredientUnits?.find(
                                                  (item) =>
                                                    item.ingredient_uuid ===
                                                    selectedIngredientUuid,
                                                )?.units || [];
                                              return !associatedUnits.some(
                                                (au) =>
                                                  au.unit_uuid ===
                                                  unit.unit_uuid,
                                              );
                                            })
                                            .map((unit) => ({
                                              value: unit.unit_uuid,
                                              label: unit.unit_name,
                                            })) || [];

                                        if (otherUnits.length > 0) {
                                          groups.push({
                                            label: "All Units",
                                            options: otherUnits,
                                          });
                                        }

                                        return groups;
                                      })()}
                                      onCreateOption={async (value) => {
                                        try {
                                          if (
                                            !currentRestaurant?.restaurant_uuid
                                          ) {
                                            throw new Error(
                                              "No restaurant selected",
                                            );
                                          }
                                          const newUnit =
                                            await unitService.createUnit(
                                              { unit_name: value },
                                              currentRestaurant.restaurant_uuid,
                                            );
                                          field.onChange({
                                            unit_uuid: newUnit.unit_uuid,
                                            unit_name: newUnit.unit_name,
                                          });
                                          queryClient.invalidateQueries([
                                            "units",
                                          ]);
                                        } catch (error) {
                                          console.error(
                                            "Failed to create unit:",
                                            error,
                                          );
                                        }
                                      }}
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
                              name={`invoice_ingredients.${index}.unit_cost`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Unit Cost</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value),
                                        )
                                      }
                                      placeholder=""
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`invoice_ingredients.${index}.vat`}
                              render={({ field }) => (
                                <FormItem className="w-24">
                                  <FormLabel>VAT</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value),
                                        )
                                      }
                                      placeholder=""
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
                    ),
                  )}
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

                <div className="mt-auto p-8 bg-gray-50 border-t">
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save changes</Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
        <NewIngredientDialog
          open={showIngredientDialog}
          onOpenChange={setShowIngredientDialog}
          onSubmit={async (data) => {
            try {
              if (!currentRestaurant?.restaurant_uuid) return;
              const newIngredient = await inventoryService.createIngredient(
                currentRestaurant.restaurant_uuid,
                data,
              );
              queryClient.invalidateQueries(["ingredients"]);
              setShowIngredientDialog(false);
            } catch (error) {
              console.error("Failed to create ingredient:", error);
            }
          }}
        />
        <SupplierDialog
          open={showSupplierDialog}
          onOpenChange={setShowSupplierDialog}
          defaultName={newSupplierName}
          onSubmit={async (data) => {
            try {
              if (!currentRestaurant?.restaurant_uuid) return;
              const newSupplier = await supplierService.createSupplier(
                currentRestaurant.restaurant_uuid,
                data,
              );
              form.setValue("supplier", {
                supplier_uuid: newSupplier.supplier_uuid,
                supplier_name: newSupplier.supplier_name,
              });
              queryClient.invalidateQueries(["suppliers"]);
              setShowSupplierDialog(false);
            } catch (error) {
              console.error("Failed to create supplier:", error);
            }
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
