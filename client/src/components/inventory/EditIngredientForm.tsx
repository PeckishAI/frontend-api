import * as React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { tagService } from "@/services/tagService";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/lib/types";
import { unitService } from "@/services/unitService";
import { supplierService } from "@/services/supplierService";

const editIngredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  parLevel: z.number().min(0, "Par level must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  suppliers: z
    .array(
      z.object({
        supplierId: z.string(),
        supplierName: z.string(),
        unitCost: z.number().min(0),
        packSize: z.string(),
      }),
    )
    .min(1, "At least one supplier is required"),
});

type EditIngredientFormValues = z.infer<typeof editIngredientSchema>;

interface EditIngredientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: InventoryItem;
  onSubmit: (data: EditIngredientFormValues) => void;
}

export default function EditIngredientForm({
  open,
  onOpenChange,
  ingredient,
  onSubmit,
}: EditIngredientFormProps) {
  const [editingSupplier, setEditingSupplier] = React.useState<number | null>(
    null,
  );
  const { currentRestaurant } = useRestaurantContext();

  const { data: unitsData } = useQuery({
    queryKey: ["units", currentRestaurant?.restaurant_uuid],
    queryFn: async () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      const restaurantUnits = await unitService.getRestaurantUnit(
        currentRestaurant.restaurant_uuid,
      );
      return restaurantUnits;
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return tagService.getRestaurantTags(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
    select: (data) => data.data,
  });

  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return supplierService.getRestaurantSuppliers(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
    select: (data) => data.data,
  });
  console.log("Supplier data : ", suppliersData);

  const form = useForm<EditIngredientFormValues>({
    resolver: zodResolver(editIngredientSchema),
    defaultValues: {
      name: "",
      tags: [],
      parLevel: 0,
      quantity: 0,
      unit: "",
      suppliers: [],
    },
  });

  React.useEffect(() => {
    if (ingredient) {
      form.reset({
        ...ingredient,
        parLevel: Number(ingredient.parLevel),
        quantity: Number(ingredient.quantity),
        tags: ingredient.tags || [],
      });
    }
  }, [ingredient, form]);

  const handleSubmit = (values: EditIngredientFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const addSupplier = () => {
    const currentSuppliers = form.getValues("suppliers");
    form.setValue("suppliers", [
      ...currentSuppliers,
      {
        supplierId: `new-${Date.now()}`,
        supplierName: "",
        unitCost: 0,
        packSize: "",
      },
    ]);
    setEditingSupplier(currentSuppliers.length);
  };

  const removeSupplier = (index: number) => {
    const currentSuppliers = form.getValues("suppliers");
    form.setValue(
      "suppliers",
      currentSuppliers.filter((_, i) => i !== index),
    );
  };

  const updateSupplier = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const currentSuppliers = form.getValues("suppliers");
    const updatedSuppliers = [...currentSuppliers];
    updatedSuppliers[index] = {
      ...updatedSuppliers[index],
      [field]: value,
    };
    form.setValue("suppliers", updatedSuppliers);
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{ingredient ? "Edit" : "Add"} Ingredient</SheetTitle>
          <SheetDescription>
            Make changes to the ingredient here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 pt-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-2 py-1 text-sm flex items-center gap-1"
                        >
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeTag(tag)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormControl>
                      <CreatableSelect
                        value={field.value || []}
                        onChange={(values) => field.onChange(values)}
                        options={
                          tagsData?.map((tag) => ({
                            label: tag.tag_name,
                            value: tag.tag_uuid,
                            category: "Existing Tags",
                          })) || []
                        }
                        onCreateOption={async (value) => {
                          try {
                            if (!currentRestaurant?.restaurant_uuid) {
                              throw new Error("No restaurant selected");
                            }
                            const newTag = await tagService.createTag(
                              {
                                tag_name: value,
                              },
                              currentRestaurant?.restaurant_uuid,
                            );
                            if (newTag?.tag_uuid && newTag?.tag_name) {
                              const updatedValue = [
                                ...(field.value || []),
                                newTag.tag_name,
                              ];
                              field.onChange(updatedValue);
                            }
                          } catch (error) {
                            console.error("Failed to create tag:", error);
                          }
                        }}
                        placeholder="Add a tag..."
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Par Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <CreatableSelect
                      value={[field.value]}
                      onChange={(values) => field.onChange(values[0])}
                      options={
                        unitsData?.map((unit) => ({
                          label: unit.unit_name,
                          value: unit.unit_name,
                          category: unit.category,
                        })) || []
                      }
                      onCreateOption={field.onChange}
                      placeholder="Select or create unit"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t mt-6 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Suppliers</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSupplier}
                >
                  Add Supplier
                </Button>
              </div>
              <div className="space-y-4">
                {form.watch("suppliers")?.map((supplier, index) => (
                  <div
                    key={supplier.supplierId}
                    className="border border-gray-200 bg-white p-4 rounded-lg shadow-sm"
                  >
                    {editingSupplier === index ? (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <CreatableSelect
                                  value={field.value ? [field.value] : []}
                                  onChange={(values) => {
                                    field.onChange(values[0] || "");
                                  }}
                                  options={
                                    suppliersData?.map((supplier) => ({
                                      value: supplier.supplier_uuid,
                                      label: supplier.name,
                                    })) || []
                                  }
                                  onCreateOption={(inputValue) => {
                                    field.onChange(inputValue);
                                  }}
                                  placeholder="Select or create supplier"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">
                              Unit Cost
                            </div>
                            <Input
                              type="number"
                              step="0.01"
                              value={supplier.unitCost}
                              onChange={(e) =>
                                updateSupplier(
                                  index,
                                  "unitCost",
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">
                              Pack Size
                            </div>
                            <Input
                              value={supplier.packSize}
                              onChange={(e) =>
                                updateSupplier(
                                  index,
                                  "packSize",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSupplier(null)}
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-medium text-gray-900">
                            {supplier.supplierName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingSupplier(index)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSupplier(index)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">
                              Unit Cost
                            </div>
                            <div className="font-medium">
                              ${supplier.unitCost.toFixed(2)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">
                              Pack Size
                            </div>
                            <div className="font-medium">
                              {supplier.packSize}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
