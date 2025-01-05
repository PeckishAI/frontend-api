
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import { menuService } from "@/services/menuService";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";
import CategoryModal from "./CategoryModal";

const productSchema = z.object({
  product_name: z.string().min(1, "Name is required"),
  category: z.object({
    category_uuid: z.string().optional(),
    category_name: z.string(),
    emoji: z.string(),
  }),
  portion_count: z.number().min(1, "Portion count must be at least 1"),
  portion_price: z.number().min(0, "Price must be at least 0"),
  product_ingredients: z.array(
    z.object({
      ingredient_uuid: z.string(),
      ingredient_name: z.string(),
      quantity: z.number().min(0),
      recipe_unit: z.object({
        unit_uuid: z.string(),
        unit_name: z.string(),
      }),
      base_to_recipe: z.number(),
    }),
  ),
  product_preparations: z.array(
    z.object({
      preparation_uuid: z.string(),
      preparation_name: z.string(),
      quantity: z.number().min(0),
      recipe_unit: z.object({
        unit_uuid: z.string(),
        unit_name: z.string(),
      }),
      base_to_recipe: z.number(),
    }),
  ),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => void;
}) {
  const [showNewIngredientDialog, setShowNewIngredientDialog] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const { currentRestaurant } = useRestaurantContext();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      portion_count: 1,
      portion_price: 0,
      product_ingredients: [],
      product_preparations: [],
    },
  });

  const addIngredient = () => {
    const currentIngredients = form.getValues("product_ingredients") || [];
    form.setValue("product_ingredients", [
      ...currentIngredients,
      {
        ingredient_uuid: "",
        ingredient_name: "",
        quantity: 0,
        recipe_unit: { unit_uuid: "", unit_name: "" },
        base_to_recipe: 1,
      },
    ]);
  };

  const addPreparation = () => {
    const currentPreparations = form.getValues("product_preparations") || [];
    form.setValue("product_preparations", [
      ...currentPreparations,
      {
        preparation_uuid: "",
        preparation_name: "",
        quantity: 0,
        recipe_unit: { unit_uuid: "", unit_name: "" },
        base_to_recipe: 1,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("product_ingredients");
    form.setValue(
      "product_ingredients",
      currentIngredients.filter((_, i) => i !== index),
    );
  };

  const removePreparation = (index: number) => {
    const currentPreparations = form.getValues("product_preparations");
    form.setValue(
      "product_preparations",
      currentPreparations.filter((_, i) => i !== index),
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <ScrollArea className="h-[90vh]">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 pt-6"
                >
                  <FormField
                    control={form.control}
                    name="product_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <CreatableSelect
                              value={
                                field.value
                                  ? {
                                      value: field.value.category_uuid || "",
                                      label: field.value.category_name,
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  field.onChange({
                                    category_uuid: option.value,
                                    category_name: option.label,
                                    emoji: "🍽️",
                                  });
                                }
                              }}
                              onCreateOption={(inputValue) => {
                                setNewItemName(inputValue);
                                setShowCategoryModal(true);
                              }}
                              options={useQuery({
                                queryKey: [
                                  "categories",
                                  currentRestaurant?.restaurant_uuid,
                                ],
                                queryFn: async () => {
                                  if (!currentRestaurant?.restaurant_uuid)
                                    return [];
                                  const categories =
                                    await categoryService.getRestaurantCategories(
                                      currentRestaurant.restaurant_uuid,
                                    );
                                  return categories.map((cat: any) => ({
                                    value: cat.category_uuid,
                                    label: cat.category_name,
                                  }));
                                },
                              }).data || []}
                              placeholder=""
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portion_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portions</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portion_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
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
                  </div>

                  <div className="space-y-8">
                    {/* Ingredients Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Ingredients</h3>
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

                      {form
                        .watch("product_ingredients")
                        ?.map((_, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end"
                          >
                            <FormField
                              control={form.control}
                              name={`product_ingredients.${index}.ingredient_name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Ingredient
                                  </FormLabel>
                                  <FormControl>
                                    <CreatableSelect
                                      value={
                                        field.value
                                          ? {
                                              label: field.value,
                                              value: form.watch(
                                                `product_ingredients.${index}.ingredient_uuid`,
                                              ),
                                            }
                                          : null
                                      }
                                      onChange={(option) => {
                                        if (option) {
                                          field.onChange(option.label);
                                          form.setValue(
                                            `product_ingredients.${index}.ingredient_uuid`,
                                            option.value,
                                          );
                                        }
                                      }}
                                      options={useQuery({
                                        queryKey: [
                                          "ingredients",
                                          currentRestaurant?.restaurant_uuid,
                                        ],
                                        queryFn: () => {
                                          if (!currentRestaurant?.restaurant_uuid)
                                            return [];
                                          return inventoryService
                                            .getRestaurantIngredients(
                                              currentRestaurant.restaurant_uuid,
                                            )
                                            .then((ingredients) =>
                                              ingredients.map((ing: any) => ({
                                                label: ing.ingredient_name,
                                                value: ing.ingredient_uuid,
                                              })),
                                            );
                                        },
                                      }).data || []}
                                      onCreateOption={(inputValue) => {
                                        setNewItemName(inputValue);
                                        setShowNewIngredientDialog(true);
                                      }}
                                      placeholder=""
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`product_ingredients.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Quantity
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="any"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value),
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`product_ingredients.${index}.recipe_unit.unit_uuid`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Unit
                                  </FormLabel>
                                  <FormControl>
                                    <CreatableSelect
                                      value={
                                        field.value
                                          ? {
                                              value: field.value,
                                              label: form.watch(
                                                `product_ingredients.${index}.recipe_unit.unit_name`,
                                              ),
                                            }
                                          : null
                                      }
                                      onChange={(option) => {
                                        if (option) {
                                          form.setValue(
                                            `product_ingredients.${index}.recipe_unit`,
                                            {
                                              unit_uuid: option.value,
                                              unit_name: option.label,
                                            },
                                          );
                                        }
                                      }}
                                      options={useQuery({
                                        queryKey: [
                                          "units",
                                          currentRestaurant?.restaurant_uuid,
                                        ],
                                        queryFn: () => {
                                          if (!currentRestaurant?.restaurant_uuid)
                                            return [];
                                          return unitService
                                            .getRestaurantUnit(
                                              currentRestaurant.restaurant_uuid,
                                            )
                                            .then((units) =>
                                              units.map((unit: any) => ({
                                                label: unit.unit_name,
                                                value: unit.unit_uuid,
                                              })),
                                            );
                                        },
                                      }).data || []}
                                      placeholder=""
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`product_ingredients.${index}.base_to_recipe`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Factor
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="any"
                                      placeholder="Conv. factor"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value),
                                        )
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
                              onClick={() => removeIngredient(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>

                    {/* Preparations Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Preparations</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPreparation}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Preparation
                        </Button>
                      </div>

                      {form
                        .watch("product_preparations")
                        ?.map((_, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end"
                          >
                            <FormField
                              control={form.control}
                              name={`product_preparations.${index}.preparation_name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Preparation
                                  </FormLabel>
                                  <FormControl>
                                    <CreatableSelect
                                      value={
                                        field.value
                                          ? {
                                              label: field.value,
                                              value: form.watch(
                                                `product_preparations.${index}.preparation_uuid`,
                                              ),
                                            }
                                          : null
                                      }
                                      onChange={(option) => {
                                        if (option) {
                                          field.onChange(option.label);
                                          form.setValue(
                                            `product_preparations.${index}.preparation_uuid`,
                                            option.value,
                                          );
                                        }
                                      }}
                                      options={useQuery({
                                        queryKey: [
                                          "preparations",
                                          currentRestaurant?.restaurant_uuid,
                                        ],
                                        queryFn: () => {
                                          if (!currentRestaurant?.restaurant_uuid)
                                            return [];
                                          return menuService
                                            .getRestaurantPreparations(
                                              currentRestaurant.restaurant_uuid,
                                            )
                                            .then((preparations) =>
                                              preparations.map((prep: any) => ({
                                                label: prep.preparation_name,
                                                value: prep.preparation_uuid,
                                              })),
                                            );
                                        },
                                      }).data || []}
                                      placeholder=""
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`product_preparations.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Quantity
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="any"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value),
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`product_preparations.${index}.recipe_unit.unit_uuid`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Unit
                                  </FormLabel>
                                  <FormControl>
                                    <CreatableSelect
                                      value={
                                        field.value
                                          ? {
                                              value: field.value,
                                              label: form.watch(
                                                `product_preparations.${index}.recipe_unit.unit_name`,
                                              ),
                                            }
                                          : null
                                      }
                                      onChange={(option) => {
                                        if (option) {
                                          form.setValue(
                                            `product_preparations.${index}.recipe_unit`,
                                            {
                                              unit_uuid: option.value,
                                              unit_name: option.label,
                                            },
                                          );
                                        }
                                      }}
                                      options={useQuery({
                                        queryKey: [
                                          "units",
                                          currentRestaurant?.restaurant_uuid,
                                        ],
                                        queryFn: () => {
                                          if (!currentRestaurant?.restaurant_uuid)
                                            return [];
                                          return unitService
                                            .getRestaurantUnit(
                                              currentRestaurant.restaurant_uuid,
                                            )
                                            .then((units) =>
                                              units.map((unit: any) => ({
                                                label: unit.unit_name,
                                                value: unit.unit_uuid,
                                              })),
                                            );
                                        },
                                      }).data || []}
                                      placeholder=""
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`product_preparations.${index}.base_to_recipe`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Factor
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="any"
                                      placeholder="Conv. factor"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value),
                                        )
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
                              onClick={() => removePreparation(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Product</Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <NewIngredientDialog
        open={showNewIngredientDialog}
        onOpenChange={setShowNewIngredientDialog}
        defaultName={newItemName}
        onSubmit={async (data) => {
          if (!currentRestaurant?.restaurant_uuid) return;
          await inventoryService.createIngredient(
            currentRestaurant.restaurant_uuid,
            data,
          );
          queryClient.invalidateQueries(["ingredients"]);
          setShowNewIngredientDialog(false);
        }}
      />

      <CategoryModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        defaultValues={{
          category_name: newItemName,
          emoji: "🍽️",
        }}
        onSubmit={async (data) => {
          if (!currentRestaurant?.restaurant_uuid) return;
          const newCategory = await categoryService.createCategory(
            currentRestaurant.restaurant_uuid,
            data,
          );
          form.setValue("category", {
            category_uuid: newCategory.category_uuid,
            category_name: newCategory.category_name,
            emoji: newCategory.emoji,
          });
          queryClient.invalidateQueries(["categories"]);
          setShowCategoryModal(false);
        }}
      />
    </>
  );
}
