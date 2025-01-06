import * as React from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
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
import { tagService } from "@/services/tagService";
import { supplierService } from "@/services/supplierService";
import { type Supplier } from "@/lib/types";
import { inventoryService } from "@/services/inventoryService";

const editIngredientSchema = z.object({
  ingredient_name: z.string().min(1, "Name is required"),
  tags: z.array(
    z.object({
      tag_uuid: z.string(),
      tag_name: z.string(),
    }),
  ),
  par_level: z.number().min(0, "Par level must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  base_unit: z.object({
    unit_uuid: z.string(),
    unit_name: z.string(),
  }),
  ingredient_suppliers: z
    .array(
      z.object({
        uuid: z.string().optional(),
        supplier: z.object({
          supplier_uuid: z.string(),
          supplier_name: z.string(),
        }),
        unit_cost: z.number().min(0).optional(),
        unit: z
          .object({
            unit_uuid: z.string().optional().nullable(),
            unit_name: z.string().optional().nullable(),
          })
          .optional()
          .nullable(),
        pack_size: z.number().min(0).optional(),
        product_code: z.string().nullable().optional(),
      }),
    )
    .optional(),
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
    queryFn: async () => {
      console.log("Fetching suppliers for restaurant:", currentRestaurant?.restaurant_uuid);
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      const response = await supplierService.getRestaurantSuppliers(
        currentRestaurant.restaurant_uuid,
      );
      console.log("Received suppliers data:", response);
      return response;
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
    select: (data) => {
      console.log("Processing suppliers data:", data);
      return data.data;
    },
  });

  const form = useForm<EditIngredientFormValues>({
    resolver: zodResolver(editIngredientSchema),
    defaultValues: {
      ingredient_name: "",
      tags: [],
      par_level: 0,
      quantity: 0,
      base_unit: {},
      ingredient_suppliers: [],
    },
  });

  // Debug form state changes
  React.useEffect(() => {
    console.log("Form state updated:", {
      isDirty: form.formState.isDirty,
      errors: form.formState.errors,
      isValid: form.formState.isValid,
      isSubmitting: form.formState.isSubmitting,
      submitCount: form.formState.submitCount,
    });
  }, [form.formState]);

  React.useEffect(() => {
    if (ingredient) {
      form.reset({
        ...ingredient,
        par_level: Number(ingredient.par_level),
        quantity: Number(ingredient.quantity),
        tags: ingredient.tags || [],
      });
    }
  }, [ingredient, form]);

  const queryClient = useQueryClient();

  const handleSubmit = async (values: EditIngredientFormValues) => {
    console.log("Attempting form submission");

    // Pre-submission validation check
    const isValid = await form.trigger();
    console.log("Pre-submission validation:", {
      isValid,
      values,
      errors: form.formState.errors,
    });

    if (!isValid) {
      console.error("Form validation failed:", form.formState.errors);
      return;
    }

    if (!currentRestaurant?.restaurant_uuid) {
      throw new Error("No restaurant selected");
    }
    if (!ingredient?.ingredient_uuid) {
      throw new Error("No ingredient selected");
    }

    try {
      await inventoryService.updateIngredient(
        currentRestaurant.restaurant_uuid,
        ingredient.ingredient_uuid,
        values,
      );
      await queryClient.invalidateQueries([
        "inventory",
        currentRestaurant.restaurant_uuid,
      ]);
      onSubmit(values);
      onOpenChange(false);
      form.reset(values);
    } catch (error) {
      console.error("Failed to update ingredient:", error);
      throw error;
    }
  };

  const addSupplier = () => {
    const currentSuppliers = form.getValues("ingredient_suppliers");
    form.setValue("ingredient_suppliers", [
      ...currentSuppliers,
      {
        unit_cost: 0,
        pack_size: 1,
      },
    ]);
    setEditingSupplier(currentSuppliers.length);
  };

  const removeSupplier = (index: number) => {
    const currentSuppliers = form.getValues("ingredient_suppliers") || [];
    const filteredSuppliers = currentSuppliers.filter((_, i) => i !== index);

    form.setValue("ingredient_suppliers", filteredSuppliers, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // Force re-render of the form
    form.trigger("ingredient_suppliers");
  };

  const updateSupplier = (
    index: number,
    field: string,
    value: string | object,
  ) => {
    const currentSuppliers = form.getValues("ingredient_suppliers");
    const updatedSuppliers = [...currentSuppliers];
    updatedSuppliers[index] = {
      ...updatedSuppliers[index],
      [field]: value,
    };
    form.setValue("ingredient_suppliers", updatedSuppliers);
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag.tag_uuid !== tagToRemove),
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
              name="ingredient_name"
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
                          key={tag.tag_uuid}
                          variant="secondary"
                          className="px-2 py-1 text-sm flex items-center gap-1"
                        >
                          {tag.tag_name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => {
                              const newTags = field.value.filter(
                                (t) => t.tag_uuid !== tag.tag_uuid,
                              );
                              field.onChange(newTags);
                            }}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormControl>
                      <CreatableSelect
                        multiple
                        value={field.value.map((tag) => tag.tag_uuid)}
                        onChange={(values) => {
                          const selectedTags = values.map((value) => {
                            const tagData = tagsData?.find(
                              (tag) => tag.tag_uuid === value,
                            );
                            return {
                              tag_uuid: value,
                              tag_name: tagData?.tag_name || value,
                            };
                          });
                          field.onChange(selectedTags);
                        }}
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
                                ...field.value,
                                {
                                  tag_uuid: newTag.tag_uuid,
                                  tag_name: newTag.tag_name,
                                },
                              ];
                              field.onChange(updatedValue);
                            }
                          } catch (error) {
                            console.error("Failed to create tag:", error);
                          }
                        }}
                        placeholder=""
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
                name="par_level"
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
              name="base_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <CreatableSelect
                      value={
                        field.value?.unit_uuid
                          ? {
                              value: field.value.unit_uuid,
                              label: field.value.unit_name,
                            }
                          : null
                      }
                      onChange={(values) => {
                        if (values) {
                          const selectedUnit = unitsData?.find(
                            (u) => u.unit_uuid === values.value,
                          ) || {
                            unit_uuid: values.value,
                            unit_name: values.label,
                          };
                          field.onChange({
                            unit_uuid: selectedUnit.unit_uuid,
                            unit_name: selectedUnit.unit_name,
                          });
                        }
                      }}
                      options={
                        unitsData?.map((unit) => ({
                          label: unit.unit_name,
                          value: unit.unit_uuid,
                          category: unit.category,
                        })) || []
                      }
                      onCreateOption={async (value) => {
                        try {
                          if (!currentRestaurant?.restaurant_uuid) {
                            throw new Error("No restaurant selected");
                          }
                          const newUnit = await unitService.createUnit(
                            { unit_name: value },
                            currentRestaurant.restaurant_uuid,
                          );
                          if (newUnit?.unit_uuid && newUnit?.unit_name) {
                            field.onChange({
                              unit_uuid: newUnit.unit_uuid,
                              unit_name: newUnit.unit_name,
                            });
                          }
                        } catch (error) {
                          console.error("Failed to create unit:", error);
                        }
                      }}
                      placeholder=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t mt-6 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Suppliers</h3>
              </div>
              <div className="space-y-4">
                {form
                  .watch("ingredient_suppliers")
                  ?.map((ingredientSupplier, index) => (
                    <div
                      key={ingredientSupplier.uuid}
                      className="border border-gray-200 bg-white p-4 rounded-lg shadow-sm"
                    >
                      {editingSupplier === index ? (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`ingredient_suppliers.${index}.supplier`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <CreatableSelect
                                    value={
                                      field.value?.supplier_uuid
                                        ? {
                                            value: field.value.supplier_uuid,
                                            label: field.value.supplier_name,
                                          }
                                        : null
                                    }
                                    onChange={(option) => {
                                      if (option) {
                                        const selectedSupplier = suppliersData?.find(
                                          (s) => s.supplier_uuid === option.value
                                        );
                                        field.onChange({
                                          supplier_uuid: selectedSupplier?.supplier_uuid || option.value,
                                          supplier_name: selectedSupplier?.supplier_name || option.label,
                                        });
                                      }
                                    }}
                                    options={
                                      suppliersData?.map((supplier) => ({
                                        value: supplier.supplier_uuid,
                                        label: supplier.supplier_name,
                                      })) || []
                                    }
                                    onCreateOption={async (inputValue) => {
                                      try {
                                        if (
                                          !currentRestaurant?.restaurant_uuid
                                        ) {
                                          throw new Error(
                                            "No restaurant selected",
                                          );
                                        }
                                        const newSupplier =
                                          await supplierService.createSupplier(
                                            { supplier_name: inputValue },
                                            currentRestaurant.restaurant_uuid,
                                          );
                                        if (
                                          newSupplier?.supplier_uuid &&
                                          newSupplier?.supplier_name
                                        ) {
                                          field.onChange({
                                            supplier_uuid:
                                              newSupplier.supplier_uuid,
                                            supplier_name:
                                              newSupplier.supplier_name,
                                          });
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Failed to create supplier:",
                                          error,
                                        );
                                      }
                                    }}
                                    placeholder=""
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`ingredient_suppliers.${index}.unit_cost`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="space-y-2">
                                      <div className="text-sm text-gray-500">
                                        Unit Cost
                                      </div>
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
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`ingredient_suppliers.${index}.unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Unit</FormLabel>
                                  <FormControl>
                                    <CreatableSelect
                                      value={
                                        field.value?.unit_name
                                          ? [field.value.unit_name]
                                          : []
                                      }
                                      onChange={(values) => {
                                        if (values[0]) {
                                          const selectedUnit = unitsData?.find(
                                            (u) => u.unit_uuid === values[0],
                                          ) || {
                                            unit_uuid: values[0],
                                            unit_name: values[0],
                                          };
                                          field.onChange({
                                            unit_uuid: selectedUnit.unit_uuid,
                                            unit_name: selectedUnit.unit_name,
                                          });
                                        }
                                      }}
                                      options={
                                        unitsData?.map((unit) => ({
                                          label: unit.unit_name,
                                          value: unit.unit_uuid,
                                          category: unit.category,
                                        })) || []
                                      }
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
                                          if (
                                            newUnit?.unit_uuid &&
                                            newUnit?.unit_name
                                          ) {
                                            field.onChange({
                                              unit_uuid: newUnit.unit_uuid,
                                              unit_name: newUnit.unit_name,
                                            });
                                          }
                                        } catch (error) {
                                          console.error(
                                            "Failed to create unit:",
                                            error,
                                          );
                                        }
                                      }}
                                      placeholder=""
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`ingredient_suppliers.${index}.pack_size`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="space-y-2">
                                      <div className="text-sm text-gray-500">
                                        Pack Size
                                      </div>
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
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSupplier(null);
                              }}
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-medium text-gray-900">
                              {ingredientSupplier.supplier.supplier_name}
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
                                {(ingredientSupplier.unit_cost || 0).toFixed(2)}{" "}
                                / {ingredientSupplier.unit.unit_name}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">
                                Pack Size
                              </div>
                              <div className="font-medium">
                                {ingredientSupplier.pack_size}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSupplier}
              >
                Add Supplier
              </Button>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}