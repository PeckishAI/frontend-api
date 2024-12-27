import * as React from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { CreatableSelect } from "@/components/ui/creatable-select";
import type { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import { tagService } from "@/services/tagService";
import { supplierService } from "@/services/supplierService";

const newIngredientSchema = z.object({
  ingredient_name: z.string().min(1, "Name is required"),
  tags: z.array(
    z.object({
      tag_uuid: z.string(),
      tag_name: z.string(),
    }),
  ),
  par_level: z.number().min(0, "Par level must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.object({
    unit_uuid: z.string(),
    unit_name: z.string(),
  }),
  ingredient_suppliers: z.array(
    z.object({
      supplier: z.object({
        supplier_uuid: z.string(),
        supplier_name: z.string(),
      }),
      unit_cost: z.number().min(0),
      pack_size: z.number().min(0),
      unit: z.object({
        unit_uuid: z.string(),
        unit_name: z.string(),
      }),
    }),
  ),
});

type NewIngredientFormValues = z.infer<typeof newIngredientSchema>;

interface NewIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewIngredientFormValues) => void;
  embedded?: boolean;
}

import SupplierDialog from "@/components/suppliers/SupplierDialog";

export default function NewIngredientDialog({
  open,
  onOpenChange,
  onSubmit,
  embedded = false,
}: NewIngredientDialogProps) {
  const { currentRestaurant } = useRestaurantContext();

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
  });

  const { data: unitsData } = useQuery({
    queryKey: ["units", currentRestaurant?.restaurant_uuid],
    queryFn: async () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      const [referenceUnits, restaurantUnits] = await Promise.all([
        unitService.getReferenceUnit(),
        unitService.getRestaurantUnit(currentRestaurant.restaurant_uuid),
      ]);
      return [...referenceUnits, ...restaurantUnits];
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

  const form = useForm<NewIngredientFormValues>({
    resolver: zodResolver(newIngredientSchema),
    defaultValues: {
      ingredient_name: "",
      tags: [],
      par_level: 0,
      quantity: 0,
      unit: {},
      ingredient_suppliers: [],
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {});
    return () => subscription.unsubscribe();
  }, [form]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const queryClient = useQueryClient();
  
  const handleSubmit = async (values: NewIngredientFormValues) => {
    if (!currentRestaurant?.restaurant_uuid) {
      throw new Error("No restaurant selected");
    }
    setIsSubmitting(true);
    try {
      const createdIngredient = await inventoryService.createIngredient(
        currentRestaurant?.restaurant_uuid,
        values,
      );
      await queryClient.invalidateQueries(["inventory", currentRestaurant?.restaurant_uuid]);
      onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create ingredient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showSupplierDialog, setShowSupplierDialog] = React.useState(false);
  const [newSupplierName, setNewSupplierName] = React.useState("");

  const formContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 pt-4"
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
                    placeholder=""
                    value={field.value.map((tag) => ({
                      value: tag.tag_uuid,
                      label: tag.tag_name,
                    }))}
                    onChange={(option) => {
                      if (!option) {
                        field.onChange([]);
                        return;
                      }
                      field.onChange([
                        ...field.value,
                        {
                          tag_uuid: option.value,
                          tag_name: option.label,
                        },
                      ]);
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                  value={
                    field.value.unit_name
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

        <div className="mt-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Suppliers</h3>
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,40px] gap-4 mb-2">
              <div className="text-sm text-gray-500">Supplier</div>
              <div className="text-sm text-gray-500">Product Code</div>
              <div className="text-sm text-gray-500">Unit Cost</div>
              <div className="text-sm text-gray-500">Unit</div>
              <div className="text-sm text-gray-500">Pack Size</div>
              <div></div>
            </div>
            {form.watch("ingredient_suppliers")?.map((supplier, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,40px] gap-4 items-end"
              >
                <FormField
                  control={form.control}
                  name={`ingredient_suppliers.${index}.supplier`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CreatableSelect
                          value={
                            field.value?.supplier_name
                              ? {
                                  value: field.value.supplier_uuid,
                                  label: field.value.supplier_name,
                                }
                              : null
                          }
                          onChange={(option) => {
                            if (option) {
                              field.onChange({
                                supplier_uuid: option.value,
                                supplier_name: option.label,
                              });
                            }
                          }}
                          options={
                            suppliersData?.map((supplier: any) => ({
                              label: supplier.supplier_name,
                              value: supplier.supplier_uuid,
                            })) || []
                          }
                          onCreateOption={(inputValue) => {
                            setNewSupplierName(inputValue);
                            setShowSupplierDialog(true);
                          }}
                          placeholder=""
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`ingredient_suppliers.${index}.product_code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`ingredient_suppliers.${index}.unit_cost`}
                  render={({ field }) => (
                    <FormItem>
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`ingredient_suppliers.${index}.unit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CreatableSelect
                          value={
                            field.value?.unit_name
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
                          options={
                            unitsData?.map((unit: any) => ({
                              label: unit.unit_name,
                              value: unit.unit_uuid,
                            })) || []
                          }
                          placeholder=""
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`ingredient_suppliers.${index}.pack_size`}
                  render={({ field }) => (
                    <FormItem>
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
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentSuppliers =
                      form.getValues("ingredient_suppliers") || [];
                    form.setValue(
                      "ingredient_suppliers",
                      currentSuppliers.filter((_, i) => i !== index),
                    );
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentSuppliers =
                  form.getValues("ingredient_suppliers") || [];
                form.setValue("ingredient_suppliers", [
                  ...currentSuppliers,
                  {
                    supplier: { supplier_uuid: "", supplier_name: "" },
                    product_code: "",
                    unit_cost: 0,
                    unit: { unit_uuid: "", unit_name: "" },
                    pack_size: 0,
                  },
                ]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {!embedded && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create ingredient"}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Ingredient</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new ingredient to your inventory.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
      <SupplierDialog
        open={showSupplierDialog}
        onOpenChange={setShowSupplierDialog}
        defaultName={newSupplierName}
        onSubmit={async (supplierData) => {
          if (!currentRestaurant?.restaurant_uuid) return;
          try {
            const newSupplier = await supplierService.createSupplier(
              currentRestaurant.restaurant_uuid,
              supplierData,
            );
            const currentSuppliers =
              form.getValues("ingredient_suppliers") || [];
            const lastIndex = currentSuppliers.length - 1;
            if (lastIndex >= 0) {
              form.setValue(`ingredient_suppliers.${lastIndex}.supplier`, {
                supplier_uuid: newSupplier.supplier_uuid,
                supplier_name: newSupplier.supplier_name,
              });
            }
            setShowSupplierDialog(false);
          } catch (error) {
            console.error("Failed to create supplier:", error);
          }
        }}
      />
    </Dialog>
  );
}
