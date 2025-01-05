import * as React from "react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { menuService } from "@/services/menuService";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { categoryService } from "@/services/categoryService";
import CategoryModal from "./CategoryModal";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";

const modifierSchema = z.object({
  modifier_uuid: z.string().optional(),
  modifier_name: z.string().min(1, "Name is required"),
  category: z
    .object({
      category_uuid: z.string().optional(),
      category_name: z.string().optional(),
      emoji: z.string().nullish(),
    })
    .nullish(),
  portion_count: z.number().min(1, "Portion count must be at least 1"),
  portion_price: z.number().optional(),
  portion_cost: z.number().optional(),
  modifier_ingredients: z
    .array(
      z.object({
        uuid: z.string().optional(),
        ingredient_uuid: z.string().optional(),
        ingredient_name: z.string().optional(),
        quantity: z.number().min(0, "Quantity must be positive"),
        base_unit: z.object({
          unit_uuid: z.string().optional(),
          unit_name: z.string().optional(),
        }),
        recipe_unit: z.object({
          unit_uuid: z.string().optional(),
          unit_name: z.string().optional(),
        }),
        base_to_recipe: z.number().optional(),
        unit_cost: z.number().optional(),
        total_cost: z.number().optional(),
      }),
    )
    .optional(),
  modifier_preparations: z
    .array(
      z.object({
        uuid: z.string().optional(),
        preparation_uuid: z.string().optional(),
        preparation_name: z.string().optional(),
        quantity: z.number().min(0, "Quantity must be positive"),
        base_unit: z.object({
          unit_uuid: z.string().optional(),
          unit_name: z.string().optional(),
        }),
        recipe_unit: z.object({
          unit_uuid: z.string().optional(),
          unit_name: z.string().optional(),
        }),
        base_to_recipe: z.number().optional(),
        unit_cost: z.number().optional(),
        total_cost: z.number().optional(),
      }),
    )
    .optional(),
});

type Modifier = z.infer<typeof modifierSchema>;

const useCategories = (restaurantUuid?: string) => {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      return categoryService.getRestaurantCategories(restaurantUuid);
    },
    enabled: !!restaurantUuid,
  });
  return categories;
};

const useIngredientOptions = (restaurantUuid?: string) => {
  const { data: ingredients } = useQuery({
    queryKey: ["ingredients", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      const data =
        await inventoryService.getRestaurantIngredients(restaurantUuid);
      return data;
    },
    enabled: !!restaurantUuid,
  });

  return ingredients
    ? Object.values(ingredients).map((ing: any) => ({
        label: ing.ingredient_name,
        value: ing.ingredient_uuid,
        type: "ingredient",
        unit_cost: ing.ingredient_suppliers?.length
          ? Math.min(
              ...ing.ingredient_suppliers.map(
                (supplier: any) =>
                  (supplier.unit_cost || 0) / (supplier.pack_size || 1),
              ),
            )
          : 0,
      }))
    : [];
};

const usePreparationOptions = (restaurantUuid?: string) => {
  const { data: preparations } = useQuery({
    queryKey: ["preparations", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      const data = await menuService.getRestaurantPreparations(restaurantUuid);
      return data;
    },
    enabled: !!restaurantUuid,
  });

  return preparations
    ? preparations.map((prep: any) => ({
        label: prep.preparation_name,
        value: prep.preparation_uuid,
        type: "preparation",
        unit_cost: prep.portion_cost,
      }))
    : [];
};

const useUnitOptions = (restaurantUuid?: string) => {
  const { data: units } = useQuery({
    queryKey: ["units", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      const data = await unitService.getRestaurantUnit(restaurantUuid);
      return data;
    },
    enabled: !!restaurantUuid,
  });

  return units
    ? [
        {
          label: "All Units",
          options: units.map((unit: any) => ({
            label: unit.unit_name,
            value: unit.unit_uuid,
          })),
        },
      ]
    : [];
};

export default function ModifierSheet({
  open,
  onOpenChange,
  modifier,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modifier?: Modifier;
  onSubmit: (data: Modifier) => void;
}) {
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const queryClient = useQueryClient();
  const { currentRestaurant, currencyInfo } = useRestaurantContext();

  const form = useForm<Modifier>({
    resolver: zodResolver(modifierSchema),
    defaultValues: {
      portion_count: 1,
      ...(modifier || {}),
    },
  });

  React.useEffect(() => {
    form.reset({
      portion_count: 1,
      modifier_ingredients: [],
      ...(modifier || {}),
    });
  }, [modifier, form]);

  const ingredients = form.watch("modifier_ingredients") || [];
  const preparations = form.watch("modifier_preparations") || [];

  const calculateTotalCost = () => {
    const ingredients = form.getValues("modifier_ingredients") || [];
    const preparations = form.getValues("modifier_preparations") || [];

    const totalIngredientCost = ingredients.reduce(
      (sum, ing) => sum + (ing.total_cost || 0),
      0,
    );
    const totalPrepCost = preparations.reduce(
      (sum, prep) => sum + (prep.total_cost || 0),
      0,
    );
    const portionCount = form.getValues("portion_count") || 1;

    form.setValue(
      "portion_cost",
      (totalIngredientCost + totalPrepCost) / portionCount,
    );
  };

  const getMarginPercentage = () => {
    const price = form.watch("portion_price") || 0;
    const cost = form.watch("portion_cost") || 0;
    if (price === 0) return 0;
    return (((price - cost) / price) * 100).toFixed(2);
  };

  const addIngredient = () => {
    const currentIngredients = form.getValues("modifier_ingredients") || [];
    form.setValue("modifier_ingredients", [
      ...currentIngredients,
      {
        ingredient_uuid: "",
        ingredient_name: "",
        quantity: 1,
        base_unit: { unit_uuid: "", unit_name: "" },
        recipe_unit: { unit_uuid: "", unit_name: "" },
        base_to_recipe: 1,
        unit_cost: 0,
        total_cost: 0,
      },
    ]);
  };

  const addPreparation = () => {
    const currentPreparations = form.getValues("modifier_preparations") || [];
    form.setValue("modifier_preparations", [
      ...currentPreparations,
      {
        preparation_uuid: "",
        preparation_name: "",
        quantity: 1,
        base_unit: { unit_uuid: "", unit_name: "" },
        recipe_unit: { unit_uuid: "", unit_name: "" },
        base_to_recipe: 1,
        unit_cost: 0,
        total_cost: 0,
      },
    ]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px] h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{modifier ? "Edit" : "New"} Modifier</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              try {
                if (!currentRestaurant?.restaurant_uuid) {
                  throw new Error("No restaurant selected");
                }
                onSubmit(data);
                onOpenChange(false);
              } catch (error) {
                console.error("Failed to save modifier:", error);
              }
            })}
            className="space-y-6 pt-8"
          >
            <FormField
              control={form.control}
              name="modifier_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => {
                  const [showCategoryModal, setShowCategoryModal] =
                    useState(false);
                  const [newCategoryName, setNewCategoryName] = useState("");

                  return (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <div className="flex gap-2">
                        <div className="w-12 flex items-center justify-center">
                          {field.value?.emoji}
                        </div>
                        <FormControl>
                          <CreatableSelect
                            value={
                              field.value
                                ? {
                                    value: field.value.category_uuid,
                                    label: field.value.category_name,
                                  }
                                : null
                            }
                            onChange={(option) => {
                              if (option) {
                                form.setValue("category", {
                                  category_uuid: option.value,
                                  category_name: option.label,
                                  emoji: field.value?.emoji,
                                });
                              } else {
                                form.setValue("category", undefined);
                              }
                            }}
                            onCreateOption={(inputValue) => {
                              setNewCategoryName(inputValue);
                              setShowCategoryModal(true);
                            }}
                            options={useCategories(
                              currentRestaurant?.restaurant_uuid,
                            ).map((cat) => ({
                              value: cat.category_uuid,
                              label: cat.category_name,
                            }))}
                            placeholder="Choose a category or type to create new"
                            size="large"
                          />
                        </FormControl>
                      </div>

                      <CategoryModal
                        open={showCategoryModal}
                        onOpenChange={setShowCategoryModal}
                        onSubmit={async (data) => {
                          try {
                            if (!currentRestaurant?.restaurant_uuid) return;
                            const newCategory =
                              await categoryService.createCategory(
                                currentRestaurant.restaurant_uuid,
                                data,
                              );
                            form.setValue("category", {
                              category_uuid: newCategory.category_uuid,
                              category_name: newCategory.category_name,
                              emoji: newCategory.emoji,
                            });
                            queryClient.invalidateQueries(["categories"]);
                          } catch (error) {
                            console.error("Failed to create category:", error);
                          }
                        }}
                        defaultValues={{
                          category_name: newCategoryName,
                          emoji: "🍽️",
                        }}
                      />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="portion_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Portions</FormLabel>
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="portion_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                name="portion_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value || 0}
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Margin</FormLabel>
                <div className="relative">
                  <Input
                    type="text"
                    value={`${getMarginPercentage()}%`}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </FormItem>
            </div>

            <div className="space-y-8">
              {/* Ingredients Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Ingredients</h3>
                  <div className="flex gap-2">
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
                </div>

                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-4 items-end"
                  >
                    <FormField
                      control={form.control}
                      name={`modifier_ingredients.${index}.ingredient_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Name
                          </FormLabel>
                          <FormControl>
                            <CreatableSelect
                              value={
                                field.value
                                  ? {
                                      value: ingredient.ingredient_uuid || "",
                                      label: field.value || "",
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  field.onChange(option.label);
                                  form.setValue(
                                    `modifier_ingredients.${index}.ingredient_uuid`,
                                    option.value,
                                  );
                                  form.setValue(
                                    `modifier_ingredients.${index}.unit_cost`,
                                    option.unit_cost || 0,
                                  );
                                  calculateTotalCost();
                                }
                              }}
                              onCreateOption={(inputValue) => {
                                setNewIngredientName(inputValue);
                                setShowIngredientDialog(true);
                              }}
                              options={useIngredientOptions(
                                currentRestaurant?.restaurant_uuid,
                              )}
                              placeholder=""
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`modifier_ingredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="any"
                              {...field}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value);
                                field.onChange(newValue);
                                calculateTotalCost();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`modifier_ingredients.${index}.recipe_unit.unit_uuid`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Unit
                          </FormLabel>
                          <FormControl>
                            <CreatableSelect
                              value={
                                ingredient.recipe_unit?.unit_uuid
                                  ? {
                                      value: ingredient.recipe_unit.unit_uuid,
                                      label: ingredient.recipe_unit.unit_name,
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  form.setValue(
                                    `modifier_ingredients.${index}.recipe_unit`,
                                    {
                                      unit_uuid: option.value,
                                      unit_name: option.label,
                                    },
                                  );
                                }
                              }}
                              options={useUnitOptions(
                                currentRestaurant?.restaurant_uuid,
                              )}
                              placeholder=""
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`modifier_ingredients.${index}.base_to_recipe`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
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
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value);
                                field.onChange(newValue);
                                calculateTotalCost();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground">
                        {currencyInfo?.currencySymbol}
                        {(
                          (form.watch(
                            `modifier_ingredients.${index}.quantity`,
                          ) || 0) *
                          (form.watch(
                            `modifier_ingredients.${index}.base_to_recipe`,
                          ) || 0) *
                          (form.watch(
                            `modifier_ingredients.${index}.unit_cost`,
                          ) || 0)
                        ).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const currentIngredients = form.getValues(
                          "modifier_ingredients",
                        );
                        form.setValue(
                          "modifier_ingredients",
                          currentIngredients.filter((_, i) => i !== index),
                        );
                        calculateTotalCost();
                      }}
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

                {preparations.map((preparation, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-4 items-end"
                  >
                    <FormField
                      control={form.control}
                      name={`modifier_preparations.${index}.preparation_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Name
                          </FormLabel>
                          <FormControl>
                            <CreatableSelect
                              value={
                                field.value
                                  ? {
                                      value: preparation.preparation_uuid || "",
                                      label: field.value || "",
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  field.onChange(option.label);
                                  form.setValue(
                                    `modifier_preparations.${index}.preparation_uuid`,
                                    option.value,
                                  );
                                  form.setValue(
                                    `modifier_preparations.${index}.unit_cost`,
                                    option.unit_cost || 0,
                                  );
                                  calculateTotalCost();
                                }
                              }}
                              options={usePreparationOptions(
                                currentRestaurant?.restaurant_uuid,
                              )}
                              placeholder=""
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`modifier_preparations.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="any"
                              {...field}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value);
                                field.onChange(newValue);
                                calculateTotalCost();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`modifier_preparations.${index}.recipe_unit.unit_uuid`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Unit
                          </FormLabel>
                          <FormControl>
                            <CreatableSelect
                              value={
                                preparation.recipe_unit?.unit_uuid
                                  ? {
                                      value: preparation.recipe_unit.unit_uuid,
                                      label: preparation.recipe_unit.unit_name,
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  form.setValue(
                                    `modifier_preparations.${index}.recipe_unit`,
                                    {
                                      unit_uuid: option.value,
                                      unit_name: option.label,
                                    },
                                  );
                                }
                              }}
                              options={useUnitOptions(
                                currentRestaurant?.restaurant_uuid,
                              )}
                              placeholder=""
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`modifier_preparations.${index}.base_to_recipe`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
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
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value);
                                field.onChange(newValue);
                                calculateTotalCost();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground">
                        {currencyInfo?.currencySymbol}
                        {(
                          (form.watch(
                            `modifier_preparations.${index}.quantity`,
                          ) || 0) *
                          (form.watch(
                            `modifier_preparations.${index}.base_to_recipe`,
                          ) || 0) *
                          (form.watch(
                            `modifier_preparations.${index}.unit_cost`,
                          ) || 0)
                        ).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const currentPreparations = form.getValues(
                          "modifier_preparations",
                        );
                        form.setValue(
                          "modifier_preparations",
                          currentPreparations.filter((_, i) => i !== index),
                        );
                        calculateTotalCost();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              <Button type="submit">
                {modifier ? "Save changes" : "Create modifier"}
              </Button>
            </div>
          </form>
        </Form>

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
              const currentIngredients =
                form.getValues("modifier_ingredients") || [];
              form.setValue("modifier_ingredients", [
                ...currentIngredients,
                {
                  ingredient_uuid: newIngredient.ingredient_uuid,
                  ingredient_name: newIngredient.ingredient_name,
                  quantity: 1,
                  base_unit: newIngredient.unit,
                  recipe_unit: newIngredient.unit,
                  base_to_recipe: 1,
                  unit_cost: 0,
                  total_cost: 0,
                },
              ]);
              queryClient.invalidateQueries(["ingredients"]);
              setShowIngredientDialog(false);
            } catch (error) {
              console.error("Failed to create ingredient:", error);
            }
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
