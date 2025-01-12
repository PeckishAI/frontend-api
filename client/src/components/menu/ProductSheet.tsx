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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { menuService } from "@/services/menuService";
import { categoryService } from "@/services/categoryService";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { foodEmojis } from "@/lib/emojis";
import CategoryModal from "./CategoryModal";
import NewIngredientDialog from "../inventory/NewIngredientDialog";

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

const productSchema = z.object({
  product_uuid: z.string().optional(),
  product_name: z.string().min(1, "Name is required"),
  category: z
    .object({
      category_uuid: z.string().optional().nullable(),
      category_name: z.string().optional().nullable(),
      emoji: z.string().nullable().optional(),
    })
    .optional(),
  portion_count: z.number().min(1, "Portion count must be at least 1"),
  portion_price: z.number().optional(),
  portion_cost: z.number().optional(),
  product_ingredients: z
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
  product_preparations: z
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

const useIngredients = (restaurantUuid?: string) => {
  const { data: ingredients } = useQuery({
    queryKey: ["ingredients", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      return inventoryService.getRestaurantIngredients(restaurantUuid);
    },
    enabled: !!restaurantUuid,
  });

  return ingredients || [];
};

const useIngredientOptions = (ingredients?: any) => {
  return ingredients
    ? Object.values(ingredients).map((ing: any) => ({
        label: ing.ingredient_name,
        value: ing.ingredient_uuid,
        type: "ingredient",
      }))
    : [];
};

const usePreparations = (restaurantUuid?: string) => {
  const { data: preparations } = useQuery({
    queryKey: ["preparations", restaurantUuid],
    queryFn: () => {
      if (!restaurantUuid) return [];
      return menuService.getRestaurantPreparations(restaurantUuid);
    },
    enabled: !!restaurantUuid,
  });
  return preparations || [];
};

const usePreparationOptions = (preparations?: any) => {
  return preparations
    ? Object.values(preparations).map((prep: any) => ({
        label: prep.preparation_name,
        value: prep.preparation_uuid,
        type: "preparation",
      }))
    : [];
};

const useUnitOptions = (restaurantUuid?: string) => {
  const { data: units } = useQuery({
    queryKey: ["units", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      const [referenceUnits, restaurantUnits] = await Promise.all([
        unitService.getReferenceUnit(),
        unitService.getRestaurantUnit(restaurantUuid),
      ]);
      return [...referenceUnits, ...restaurantUnits];
    },
    enabled: !!restaurantUuid,
  });

  return units
    ? units.map((unit: any) => ({
        label: unit.unit_name,
        value: unit.unit_uuid,
      }))
    : [];
};

type Product = z.infer<typeof productSchema>;

export default function RecipeSheet({
  open,
  onOpenChange,
  product,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSubmit: (data: Product) => void;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { currentRestaurant, currencyInfo } = useRestaurantContext();
  const queryClient = useQueryClient();
  const [showNewIngredientDialog, setShowNewIngredientDialog] = useState(false);
  const [showNewPreparationDialog, setShowNewPreparationDialog] =
    useState(false);
  const [newItemName, setNewItemName] = useState("");

  const ingredientList = useIngredients(currentRestaurant?.restaurant_uuid);
  const preparationList = usePreparations(currentRestaurant?.restaurant_uuid);

  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      portion_count: 1,
      ...(product || {}),
    },
  });

  React.useEffect(() => {
    const defaultValues = {
      portion_count: 1,
      product_ingredients: [],
      ...(product || {}),
    };
    form.reset(defaultValues);
  }, [product, form]);

  const ingredients = form.watch("product_ingredients") || [];
  const preparations = form.watch("product_preparations") || [];

  const addIngredient = () => {
    const currentIngredients = form.getValues("product_ingredients") || [];
    const newIngredient = {
      ingredient_uuid: "",
      ingredient_name: "",
      quantity: 0,
      base_unit: { unit_uuid: "", unit_name: "" },
      recipe_unit: { unit_uuid: "", unit_name: "" },
      base_to_recipe: 1,
      unit_cost: 0,
      total_cost: 0,
    };
    form.setValue("product_ingredients", [
      ...currentIngredients,
      newIngredient,
    ]);
    calculateTotalCost();
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("product_ingredients");
    if (!currentIngredients) {
      return;
    }
    form.setValue(
      "product_ingredients",
      currentIngredients.filter((_, i) => i !== index),
    );
    calculateTotalCost();
  };

  const addPreparation = () => {
    const currentPreparations = form.getValues("product_preparations") || [];
    const newPreparation = {
      preparation_uuid: "",
      preparation_name: "",
      quantity: 0,
      base_unit: { unit_uuid: "", unit_name: "" },
      recipe_unit: { unit_uuid: "", unit_name: "" },
      base_to_recipe: 1,
      unit_cost: 0,
      total_cost: 0,
    };
    form.setValue("product_preparations", [
      ...currentPreparations,
      newPreparation,
    ]);
    calculateTotalCost();
  };

  const removePreparation = (index: number) => {
    const currentPreparations = form.getValues("product_preparations");
    if (!currentPreparations) {
      return;
    }
    form.setValue(
      "product_preparations",
      currentPreparations.filter((_, i) => i !== index),
    );
    calculateTotalCost();
  };

  const calculateTotalCost = () => {
    const ingredients = form.getValues("product_ingredients") || [];
    const preparations = form.getValues("product_preparations") || [];

    const totalIngredientCost = ingredients.reduce((sum, ing) => {
      const quantity = ing.quantity || 0;
      const unitCost = ing.unit_cost || 0;
      const conversionFactor = ing.base_to_recipe || 1;
      return sum + (quantity * unitCost) / conversionFactor;
    }, 0);

    const totalPrepCost = preparations.reduce((sum, prep) => {
      const quantity = prep.quantity || 0;
      const unitCost = prep.unit_cost || 0;
      const conversionFactor = prep.base_to_recipe || 1;
      return sum + (quantity * unitCost) / conversionFactor;
    }, 0);

    const totalCost = totalIngredientCost + totalPrepCost;
    const portionCount = form.getValues("portion_count") || 1;

    form.setValue("portion_cost", totalCost / portionCount);

    // Update individual total costs
    ingredients.forEach((ing, index) => {
      const totalCost =
        (ing.quantity || 0) * (ing.unit_cost || 0) * (ing.base_to_recipe || 1);
      form.setValue(`product_ingredients.${index}.total_cost`, totalCost);
    });

    preparations.forEach((prep, index) => {
      const totalCost =
        (prep.quantity || 0) *
        (prep.unit_cost || 0) *
        (prep.base_to_recipe || 1);
      form.setValue(`product_preparations.${index}.total_cost`, totalCost);
    });
  };

  const getMarginPercentage = () => {
    const price = form.watch("portion_price") || 0;
    const cost = form.watch("portion_cost") || 0;
    if (price === 0) return 0;
    return (((price - cost) / price) * 100).toFixed(2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[1000px] sm:max-w-[1000px] h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? "Edit" : "New"} Product</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async (data) => {
                try {
                  if (!currentRestaurant?.restaurant_uuid) {
                    throw new Error("No restaurant selected");
                  }

                  if (product?.product_uuid) {
                    // Update existing product
                    await menuService.updateProduct(
                      currentRestaurant.restaurant_uuid,
                      {
                        ...data,
                        product_uuid: product.product_uuid,
                      },
                    );
                  } else {
                    // Create new product
                    await menuService.createProduct(
                      currentRestaurant.restaurant_uuid,
                      data,
                    );
                  }

                  // Invalidate products query to refresh the list
                  queryClient.invalidateQueries(["products"]);
                  onSubmit(data);
                  onOpenChange(false);
                } catch (error) {
                  console.error("Failed to save recipe:", error);
                }
              },
              (errors) => {
                console.log("Form Validation Errors:", errors);
                console.log("Current Form State:", form.getValues());
                console.log("Form Dirty Fields:", form.formState.dirtyFields);
                console.log(
                  "Form Touched Fields:",
                  form.formState.touchedFields,
                );
              },
            )}
            className="space-y-6 pt-8"
          >
            <FormField
              control={form.control}
              name="product_name"
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
                        <FormControl>
                          <CreatableSelect
                            value={
                              field.value
                                ? {
                                    value: field.value.category_uuid || "",
                                    label: `${field.value.emoji} ${field.value.category_name}`,
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
                              label: `${cat.emoji} ${cat.category_name}`,
                            }))}
                            placeholder=""
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

                {ingredients.map((component, index) => {
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-4 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`product_ingredients.${index}.ingredient_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={index !== 0 ? "sr-only" : undefined}
                            >
                              Name
                            </FormLabel>
                            <FormControl>
                              <CreatableSelect
                                size="large"
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
                                onChange={async (option) => {
                                  if (option) {
                                    const selectedIngredient =
                                      ingredientList.find(
                                        (ing: any) =>
                                          ing.ingredient_uuid === option.value,
                                      );
                                    console.log(
                                      "Selected Ingredient:",
                                      selectedIngredient,
                                    );

                                    field.onChange(option.label);
                                    form.setValue(
                                      `product_ingredients.${index}.ingredient_uuid`,
                                      option.value,
                                    );

                                    // Calculate minimum unit cost per unit from all suppliers
                                    const minUnitCost =
                                      selectedIngredient.ingredient_suppliers.reduce(
                                        (min, supplier) => {
                                          const costPerUnit =
                                            supplier.unit_cost /
                                            (supplier.pack_size || 1);
                                          return costPerUnit < min
                                            ? costPerUnit
                                            : min;
                                        },
                                        Number.MAX_VALUE,
                                      );

                                    form.setValue(
                                      `product_ingredients.${index}.unit_cost`,
                                      minUnitCost === Number.MAX_VALUE
                                        ? 0
                                        : minUnitCost,
                                    );

                                    if (selectedIngredient?.base_unit) {
                                      form.setValue(
                                        `product_ingredients.${index}.base_unit`,
                                        {
                                          unit_uuid:
                                            selectedIngredient.base_unit
                                              .unit_uuid,
                                          unit_name:
                                            selectedIngredient.base_unit
                                              .unit_name,
                                        },
                                      );

                                      // Get conversion factor if recipe unit is already selected
                                      const recipeUnit = form.watch(
                                        `product_ingredients.${index}.recipe_unit`,
                                      );

                                      if (recipeUnit?.unit_uuid) {
                                        try {
                                          const response =
                                            await unitService.getConversionFactor(
                                              selectedIngredient.ingredient_uuid,
                                              selectedIngredient.base_unit
                                                .unit_uuid,
                                              recipeUnit.unit_uuid,
                                            );

                                          form.setValue(
                                            `product_ingredients.${index}.base_to_recipe`,
                                            response.conversion_factor,
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Failed to fetch conversion factor:",
                                            error,
                                          );
                                        }
                                      }
                                    }

                                    const quantity =
                                      form.watch(
                                        `product_ingredients.${index}.quantity`,
                                      ) || 0;
                                    const conversionFactor =
                                      form.watch(
                                        `product_ingredients.${index}.base_to_recipe`,
                                      ) || 1;
                                    const unitCost =
                                      form.watch(
                                        `product_ingredients.${index}.unit_cost`,
                                      ) || 0;

                                    form.setValue(
                                      `product_ingredients.${index}.total_cost`,
                                      (quantity / conversionFactor) * unitCost,
                                    );
                                  }
                                }}
                                options={useIngredientOptions(
                                  useIngredients(
                                    currentRestaurant?.restaurant_uuid,
                                  ),
                                )}
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
                                onChange={async (e) => {
                                  const newQuantity = parseFloat(
                                    e.target.value,
                                  );
                                  field.onChange(newQuantity);

                                  const unitCost =
                                    form.watch(
                                      `product_ingredients.${index}.unit_cost`,
                                    ) || 0;
                                  const conversionFactor =
                                    form.watch(
                                      `product_ingredients.${index}.base_to_recipe`,
                                    ) || 1;
                                  const totalCost =
                                    (newQuantity / conversionFactor) * unitCost;
                                  form.setValue(
                                    `product_ingredients.${index}.total_cost`,
                                    totalCost,
                                  );

                                  const ingredients =
                                    form.watch("product_ingredients") || [];
                                  const preparations =
                                    form.watch("product_preparations") || [];
                                  const totalIngredientCost =
                                    ingredients.reduce(
                                      (sum, ing) => sum + (ing.total_cost || 0),
                                      0,
                                    );
                                  const totalPrepCost = preparations.reduce(
                                    (sum, prep) => sum + (prep.total_cost || 0),
                                    0,
                                  );
                                  const portionCount =
                                    form.watch("portion_count") || 1;
                                  form.setValue(
                                    "portion_cost",
                                    (totalIngredientCost + totalPrepCost) /
                                      portionCount,
                                  );
                                }}
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
                              className={index !== 0 ? "sr-only" : undefined}
                            >
                              Unit
                            </FormLabel>
                            <FormControl>
                              <CreatableSelect
                                size="small"
                                value={
                                  form.watch(
                                    `product_ingredients.${index}.recipe_unit`,
                                  )
                                    ? {
                                        value: form.watch(
                                          `product_ingredients.${index}.recipe_unit.unit_uuid`,
                                        ),
                                        label: form.watch(
                                          `product_ingredients.${index}.recipe_unit.unit_name`,
                                        ),
                                      }
                                    : null
                                }
                                onChange={async (option) => {
                                  if (option) {
                                    form.setValue(
                                      `product_ingredients.${index}.recipe_unit`,
                                      {
                                        unit_uuid: option.value,
                                        unit_name: option.label,
                                      },
                                    );

                                    // Get the current ingredient and its base unit
                                    const ingredientUuid = form.watch(
                                      `product_ingredients.${index}.ingredient_uuid`,
                                    );
                                    const selectedIngredient =
                                      ingredients?.find(
                                        (ing: any) =>
                                          ing.ingredient_uuid ===
                                          ingredientUuid,
                                      );

                                    if (ingredientUuid && option.value) {
                                      try {
                                        const response =
                                          await unitService.getConversionFactor(
                                            ingredientUuid,
                                            selectedIngredient.base_unit
                                              .unit_uuid,
                                            option.value,
                                          );

                                        form.setValue(
                                          `product_ingredients.${index}.base_to_recipe`,
                                          response.conversion_factor,
                                        );
                                      } catch (error) {
                                        console.error(
                                          "Failed to fetch conversion factor:",
                                          error,
                                        );
                                      }
                                    }
                                  }
                                }}
                                options={
                                  useQuery({
                                    queryKey: [
                                      "units",
                                      currentRestaurant?.restaurant_uuid,
                                    ],
                                    queryFn: () =>
                                      unitService.getRestaurantUnit(
                                        currentRestaurant?.restaurant_uuid ||
                                          "",
                                      ),
                                    enabled:
                                      !!currentRestaurant?.restaurant_uuid,
                                  }).data?.map((unit) => ({
                                    label: unit.unit_name,
                                    value: unit.unit_uuid,
                                  })) || []
                                }
                                onCreateOption={async (inputValue) => {
                                  if (!currentRestaurant?.restaurant_uuid)
                                    return;
                                  const newUnit = await unitService.createUnit(
                                    { unit_name: inputValue },
                                    currentRestaurant.restaurant_uuid,
                                  );
                                  form.setValue(
                                    `product_ingredients.${index}.recipe_unit`,
                                    {
                                      unit_uuid: newUnit.unit_uuid,
                                      unit_name: newUnit.unit_name,
                                    },
                                  );
                                  queryClient.invalidateQueries(["units"]);
                                }}
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
                              className={index !== 0 ? "sr-only" : undefined}
                            >
                              Factor
                            </FormLabel>
                            <FormControl>
                              <Input
                                suffix={
                                  form.watch(
                                    `product_ingredients.${index}.base_unit.unit_name`,
                                  ) +
                                  " → " +
                                  form.watch(
                                    `product_ingredients.${index}.recipe_unit.unit_name`,
                                  )
                                }
                                type="number"
                                min={0}
                                step="any"
                                placeholder="Conv. factor"
                                {...field}
                                onChange={async (e) => {
                                  const newConversionFactor = parseFloat(
                                    e.target.value,
                                  );
                                  field.onChange(newConversionFactor);

                                  const unitCost =
                                    form.watch(
                                      `product_ingredients.${index}.unit_cost`,
                                    ) || 0;
                                  const quantity =
                                    form.watch(
                                      `product_ingredients.${index}.quantity`,
                                    ) || 1;
                                  const totalCost =
                                    (quantity / newConversionFactor) * unitCost;
                                  form.setValue(
                                    `product_ingredients.${index}.total_cost`,
                                    totalCost,
                                  );
                                  const ingredients =
                                    form.watch("product_ingredients") || [];
                                  const preparations =
                                    form.watch("product_preparations") || [];
                                  const totalIngredientCost =
                                    ingredients.reduce(
                                      (sum, ing) => sum + (ing.total_cost || 0),
                                      0,
                                    );
                                  const totalPrepCost = preparations.reduce(
                                    (sum, prep) => sum + (prep.total_cost || 0),
                                    0,
                                  );
                                  const portionCount =
                                    form.watch("portion_count") || 1;
                                  form.setValue(
                                    "portion_cost",
                                    (totalIngredientCost + totalPrepCost) /
                                      portionCount,
                                  );
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
                            form.watch(
                              `product_ingredients.${index}.total_cost`,
                            ) || 0
                          ).toFixed(2)}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
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
                {(form.watch("product_preparations") || []).map(
                  (preparation, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-4 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`product_preparations.${index}.preparation_name`}
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
                                        label: field.value,
                                        value: form.watch(
                                          `product_preparations.${index}.preparation_uuid`,
                                        ),
                                      }
                                    : null
                                }
                                onChange={async (option) => {
                                  if (option) {
                                    const selectedPreparation =
                                      preparationList?.find(
                                        (prep: any) =>
                                          prep.preparation_uuid ===
                                          option.value,
                                      );
                                    console.log(
                                      "Selected preparation:",
                                      selectedPreparation,
                                    );

                                    field.onChange(option.label);
                                    form.setValue(
                                      `product_preparations.${index}.preparation_uuid`,
                                      option.value,
                                    );
                                    form.setValue(
                                      `product_preparations.${index}.unit_cost`,
                                      selectedPreparation.portion_cost || 0,
                                    );
                                    console.log("Preparations: ", preparations);
                                    console.log(
                                      "Selected Preparation: ",
                                      selectedPreparation,
                                    );

                                    if (selectedPreparation?.unit) {
                                      form.setValue(
                                        `product_preparations.${index}.base_unit`,
                                        {
                                          unit_uuid:
                                            selectedPreparation.unit.unit_uuid,
                                          unit_name:
                                            selectedPreparation.unit.unit_name,
                                        },
                                      );

                                      // Get conversion factor if recipe unit is already selected
                                      const recipeUnit = form.watch(
                                        `product_preparations.${index}.recipe_unit`,
                                      );

                                      console.log("Form: ", form.getValues());

                                      if (recipeUnit?.unit_uuid) {
                                        try {
                                          const response =
                                            await unitService.getPreparationConversionFactor(
                                              selectedPreparation.preparation_uuid,
                                              selectedPreparation.unit
                                                .unit_uuid,
                                              recipeUnit.unit_uuid,
                                            );

                                          form.setValue(
                                            `product_preparations.${index}.base_to_recipe`,
                                            response.conversion_factor,
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Failed to fetch conversion factor:",
                                            error,
                                          );
                                        }
                                      }
                                    }

                                    const quantity =
                                      form.watch(
                                        `product_preparations.${index}.quantity`,
                                      ) || 0;
                                    const conversionFactor =
                                      form.watch(
                                        `product_preparations.${index}.base_to_recipe`,
                                      ) || 1;
                                    const unitCost =
                                      form.watch(
                                        `product_preparations.${index}.unit_cost`,
                                      ) || 0;

                                    form.setValue(
                                      `product_preparations.${index}.total_cost`,
                                      (quantity / conversionFactor) * unitCost,
                                    );
                                  }
                                }}
                                options={usePreparationOptions(
                                  usePreparations(
                                    currentRestaurant?.restaurant_uuid,
                                  ),
                                )}
                                onCreateOption={(inputValue) => {
                                  setNewItemName(inputValue);
                                  //setShowNewIngredientDialog(true);
                                }}
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
                                onChange={async (e) => {
                                  const newQuantity = parseFloat(
                                    e.target.value,
                                  );
                                  field.onChange(newQuantity);

                                  const unitCost =
                                    form.watch(
                                      `product_preparations.${index}.unit_cost`,
                                    ) || 0;
                                  const conversionFactor =
                                    form.watch(
                                      `product_preparations.${index}.base_to_recipe`,
                                    ) || 1;
                                  const totalCost =
                                    (newQuantity / conversionFactor) * unitCost;
                                  form.setValue(
                                    `product_preparations.${index}.total_cost`,
                                    totalCost,
                                  );

                                  const ingredients =
                                    form.watch("product_ingredients") || [];
                                  const preparations =
                                    form.watch("product_preparations") || [];
                                  const totalIngredientCost =
                                    ingredients.reduce(
                                      (sum, ing) => sum + (ing.total_cost || 0),
                                      0,
                                    );
                                  const totalPrepCost = preparations.reduce(
                                    (sum, prep) => sum + (prep.total_cost || 0),
                                    0,
                                  );
                                  const portionCount =
                                    form.watch("portion_count") || 1;
                                  form.setValue(
                                    "portion_cost",
                                    (totalIngredientCost + totalPrepCost) /
                                      portionCount,
                                  );
                                }}
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
                              className={index !== 0 ? "sr-only" : undefined}
                            >
                              Unit
                            </FormLabel>
                            <FormControl>
                              <CreatableSelect
                                value={
                                  form.watch(
                                    `product_preparations.${index}.recipe_unit`,
                                  )
                                    ? {
                                        value: form.watch(
                                          `product_preparations.${index}.recipe_unit.unit_uuid`,
                                        ),
                                        label: form.watch(
                                          `product_preparations.${index}.recipe_unit.unit_name`,
                                        ),
                                      }
                                    : null
                                }
                                onChange={async (option) => {
                                  if (option) {
                                    form.setValue(
                                      `product_preparations.${index}.recipe_unit`,
                                      {
                                        unit_uuid: option.value,
                                        unit_name: option.label,
                                      },
                                    );

                                    // Get the current ingredient and its base unit
                                    const preparationUuid = form.watch(
                                      `product_preparations.${index}.preparation_uuid`,
                                    );
                                    const preparationUnit = form.watch(
                                      `product_preparations.${index}.base_unit`,
                                    );

                                    if (
                                      preparationUuid &&
                                      option.value &&
                                      preparationUnit.unit_uuid
                                    ) {
                                      try {
                                        const response =
                                          await unitService.getPreparationConversionFactor(
                                            preparationUuid,
                                            preparationUnit.unit_uuid,
                                            option.value,
                                          );

                                        form.setValue(
                                          `product_preparations.${index}.base_to_recipe`,
                                          response.conversion_factor,
                                        );
                                      } catch (error) {
                                        console.error(
                                          "Failed to fetch conversion factor:",
                                          error,
                                        );
                                      }
                                    }
                                  }
                                }}
                                options={
                                  useQuery({
                                    queryKey: [
                                      "units",
                                      currentRestaurant?.restaurant_uuid,
                                    ],
                                    queryFn: () =>
                                      unitService.getRestaurantUnit(
                                        currentRestaurant?.restaurant_uuid ||
                                          "",
                                      ),
                                    enabled:
                                      !!currentRestaurant?.restaurant_uuid,
                                  }).data?.map((unit) => ({
                                    label: unit.unit_name,
                                    value: unit.unit_uuid,
                                  })) || []
                                }
                                onCreateOption={async (inputValue) => {
                                  if (!currentRestaurant?.restaurant_uuid)
                                    return;
                                  const newUnit = await unitService.createUnit(
                                    { unit_name: inputValue },
                                    currentRestaurant.restaurant_uuid,
                                  );
                                  form.setValue(
                                    `product_preparations.${index}.recipe_unit`,
                                    {
                                      unit_uuid: newUnit.unit_uuid,
                                      unit_name: newUnit.unit_name,
                                    },
                                  );
                                  queryClient.invalidateQueries(["units"]);
                                }}
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
                              className={index !== 0 ? "sr-only" : undefined}
                            >
                              Conversion
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                suffix={
                                  form.watch(
                                    `product_preparations.${index}.base_unit.unit_name`,
                                  ) +
                                  " → " +
                                  form.watch(
                                    `product_preparations.${index}.recipe_unit.unit_name`,
                                  )
                                }
                                min={0}
                                step="any"
                                placeholder=""
                                {...field}
                                onChange={async (e) => {
                                  const newConversionFactor = parseFloat(
                                    e.target.value,
                                  );
                                  field.onChange(newConversionFactor);

                                  const unitCost =
                                    form.watch(
                                      `product_preparations.${index}.unit_cost`,
                                    ) || 0;
                                  const quantity =
                                    form.watch(
                                      `product_preparations.${index}.quantity`,
                                    ) || 1;
                                  const totalCost =
                                    (quantity / newConversionFactor) * unitCost;
                                  form.setValue(
                                    `product_preparations.${index}.total_cost`,
                                    totalCost,
                                  );
                                  const ingredients =
                                    form.watch("product_ingredients") || [];
                                  const preparations =
                                    form.watch("product_preparations") || [];
                                  const totalIngredientCost =
                                    ingredients.reduce(
                                      (sum, ing) => sum + (ing.total_cost || 0),
                                      0,
                                    );
                                  const totalPrepCost = preparations.reduce(
                                    (sum, prep) => sum + (prep.total_cost || 0),
                                    0,
                                  );
                                  const portionCount =
                                    form.watch("portion_count") || 1;
                                  form.setValue(
                                    "portion_cost",
                                    (totalIngredientCost + totalPrepCost) /
                                      portionCount,
                                  );
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
                            form.watch(
                              `product_preparations.${index}.total_cost`,
                            ) || 0
                          ).toFixed(2)}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePreparation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                )}
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Saving...</span>
                  </div>
                ) : product ? (
                  "Save changes"
                ) : (
                  "Create recipe"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select an Emoji</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-8 gap-2">
                {foodEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-10 w-10 p-0 text-lg"
                    onClick={() => {
                      const currentCategory = form.getValues("category");
                      form.setValue("category", {
                        ...currentCategory,
                        emoji,
                      });
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <NewIngredientDialog
          open={showNewIngredientDialog}
          onOpenChange={setShowNewIngredientDialog}
          defaultName={newItemName}
          onSubmit={async (data) => {
            try {
              if (!currentRestaurant?.restaurant_uuid) return;
              const newIngredient = await inventoryService.createIngredient(
                currentRestaurant.restaurant_uuid,
                data,
              );
              queryClient.invalidateQueries(["ingredients"]);
              setShowNewIngredientDialog(false);
            } catch (error) {
              console.error("Failed to create ingredient:", error);
            }
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
