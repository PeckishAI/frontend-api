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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const defaultCategories = [
  { value: "mains", label: "Main Dishes", emoji: "🍽️" },
  { value: "starters", label: "Starters", emoji: "🥗" },
  { value: "desserts", label: "Desserts", emoji: "🍰" },
  { value: "drinks", label: "Drinks", emoji: "🥤" },
  { value: "sides", label: "Side Dishes", emoji: "🥨" },
];

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
    ? Object.values(ingredients).map((ing: any) => {
        // Calculate minimum unit cost from suppliers
        const unitCost = ing.ingredient_suppliers?.length
          ? Math.min(
              ...ing.ingredient_suppliers.map(
                (supplier: any) =>
                  (supplier.unit_cost || 0) / (supplier.pack_size || 1),
              ),
            )
          : 0;

        return {
          label: ing.ingredient_name,
          value: ing.ingredient_uuid,
          type: "ingredient",
          unit_cost: unitCost,
        };
      })
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

  if (!units) return [];

  const allUnits = units.map((unit: any) => ({
    label: unit.unit_name,
    value: unit.unit_uuid,
  }));

  return [
    {
      label: "All Units",
      options: allUnits,
    },
  ];
};

const productSchema = z.object({
  product_uuid: z.string().optional(),
  product_name: z.string().min(1, "Name is required"),
  category: z
    .object({
      category_uuid: z.string().optional(),
      category_name: z.string().optional(),
      emoji: z.string().optional(),
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
        quanity: z.number().min(0, "Quantity must be positive"),
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
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const queryClient = useQueryClient();
  const { currentRestaurant } = useRestaurantContext();

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
  const recipeComponents = [...ingredients, ...preparations];

  const handleCreateCategory = (inputValue: string) => {
    console.log("User wants to create a new category:", inputValue);
  };

  const addIngredient = () => {
    const currentIngredients = form.getValues("product_ingredients") || [];
    form.setValue("product_ingredients", [
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
    const currentPreparations = form.getValues("product_preparations") || [];
    form.setValue("product_preparations", [
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

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("product_ingredients");
    form.setValue(
      "product_ingredients",
      currentIngredients.filter((_, i) => i !== index),
    );
    calculateTotalCost();
  };

  const calculateTotalCost = () => {
    const ingredients = form.getValues("product_ingredients") || [];
    const preparations = form.getValues("product_preparations") || [];

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px] h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? "Edit" : "New"} Product</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              try {
                if (!currentRestaurant?.restaurant_uuid) {
                  throw new Error("No restaurant selected");
                }
                console.log("Submitting", data);
                onOpenChange(false);
              } catch (error) {
                console.error("Failed to save recipe:", error);
              }
            })}
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
                              console.log("trying to create");
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
                      onClick={() => setShowIngredientDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIngredient}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Existing
                    </Button>
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
                        data
                      );
                      const currentIngredients = form.getValues("product_ingredients") || [];
                      form.setValue("product_ingredients", [
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
                {ingredients.map((component, index) => {
                  const fieldPrefix = "product_ingredients";
                  const nameField = "ingredient_name";

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-4 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`${fieldPrefix}.${index}.${nameField}`}
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
                                        value: component.ingredient_uuid || "",
                                        label: field.value || "",
                                      }
                                    : null
                                }
                                onChange={async (option) => {
                                  if (option) {
                                    field.onChange(option.label);
                                    form.setValue(
                                      `${fieldPrefix}.${index}.ingredient_uuid`,
                                      option.value,
                                    );
                                    form.setValue(
                                      `${fieldPrefix}.${index}.unit_cost`,
                                      option.unit_cost || 0,
                                    );

                                    const quantity =
                                      form.watch(
                                        `${fieldPrefix}.${index}.quantity`,
                                      ) || 0;
                                    const conversionFactor =
                                      form.watch(
                                        `${fieldPrefix}.${index}.base_to_recipe`,
                                      ) || 1;
                                    const unitCost = option.unit_cost || 0;

                                    form.setValue(
                                      `${fieldPrefix}.${index}.total_cost`,
                                      quantity * conversionFactor * unitCost,
                                    );
                                  }
                                }}
                                options={useIngredientOptions(
                                  currentRestaurant?.restaurant_uuid,
                                )}
                                onCreateOption={(inputValue) => {
                                  setNewIngredientName(inputValue);
                                  setShowIngredientDialog(true);
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
                                      `${fieldPrefix}.${index}.unit_cost`,
                                    ) || 0;
                                  const conversionFactor =
                                    form.watch(
                                      `${fieldPrefix}.${index}.base_to_recipe`,
                                    ) || 1;
                                  const totalCost =
                                    newQuantity * conversionFactor * unitCost;
                                  form.setValue(
                                    `${fieldPrefix}.${index}.total_cost`,
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
                                value={
                                  field.value
                                    ? {
                                        value: field.value,
                                        label:
                                          ingredients[index]?.recipe_unit
                                            ?.unit_name || field.value,
                                      }
                                    : null
                                }
                                onChange={(option) => {
                                  if (option) {
                                    form.setValue(
                                      `${fieldPrefix}.${index}.recipe_unit`,
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
                                onCreateOption={async (inputValue) => {
                                  if (!currentRestaurant?.restaurant_uuid)
                                    return;
                                  try {
                                    const newUnit =
                                      await unitService.createUnit(
                                        { unit_name: inputValue },
                                        currentRestaurant.restaurant_uuid,
                                      );
                                    form.setValue(
                                      `${fieldPrefix}.${index}.recipe_unit`,
                                      {
                                        unit_uuid: newUnit.unit_uuid,
                                        unit_name: newUnit.unit_name,
                                      },
                                    );
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
                                      `${fieldPrefix}.${index}.unit_cost`,
                                    ) || 0;
                                  const quantity =
                                    form.watch(
                                      `${fieldPrefix}.${index}.quantity`,
                                    ) || 1;
                                  const totalCost =
                                    quantity * newConversionFactor * unitCost;
                                  form.setValue(
                                    `${fieldPrefix}.${index}.total_cost`,
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
                          $
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
                                        value:
                                          preparation.preparation_uuid || "",
                                        label: field.value || "",
                                      }
                                    : null
                                }
                                onChange={async (option) => {
                                  if (option) {
                                    field.onChange(option.label);
                                    form.setValue(
                                      `product_preparations.${index}.preparation_uuid`,
                                      option.value,
                                    );

                                    const quantity =
                                      form.watch(
                                        `product_preparations.${index}.quantity`,
                                      ) || 0;
                                    const conversionFactor =
                                      form.watch(
                                        `product_preparations.${index}.base_to_recipe`,
                                      ) || 1;
                                    const unitCost = option.unit_cost || 0;

                                    form.setValue(
                                      `product_preparations.${index}.unit_cost`,
                                      unitCost,
                                    );
                                    form.setValue(
                                      `product_preparations.${index}.total_cost`,
                                      quantity * conversionFactor * unitCost,
                                    );
                                    calculateTotalCost();

                                    const ingredients =
                                      form.watch("product_ingredients") || [];
                                    const preparations =
                                      form.watch("product_preparations") || [];
                                    const totalIngredientCost =
                                      ingredients.reduce(
                                        (sum, ing) =>
                                          sum + (ing.total_cost || 0),
                                        0,
                                      );
                                    const totalPrepCost = preparations.reduce(
                                      (sum, prep) =>
                                        sum + (prep.total_cost || 0),
                                      0,
                                    );
                                    const portionCount =
                                      form.watch("portion_count") || 1;
                                    form.setValue(
                                      "portion_cost",
                                      (totalIngredientCost + totalPrepCost) /
                                        portionCount,
                                    );
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
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value);
                                  field.onChange(newValue);

                                  const unitCost =
                                    form.watch(
                                      `product_preparations.${index}.unit_cost`,
                                    ) || 0;
                                  const conversionFactor =
                                    form.watch(
                                      `product_preparations.${index}.base_to_recipe`,
                                    ) || 1;
                                  const totalCost =
                                    newValue * conversionFactor * unitCost;

                                  form.setValue(
                                    `product_preparations.${index}.total_cost`,
                                    totalCost,
                                  );
                                  calculateTotalCost();
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
                                  preparation.recipe_unit?.unit_uuid
                                    ? {
                                        value:
                                          preparation.recipe_unit.unit_uuid,
                                        label:
                                          preparation.recipe_unit.unit_name,
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
                        name={`product_preparations.${index}.base_to_recipe`}
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

                                  const quantity =
                                    form.watch(
                                      `product_preparations.${index}.quantity`,
                                    ) || 0;
                                  const unitCost =
                                    form.watch(
                                      `product_preparations.${index}.unit_cost`,
                                    ) || 0;
                                  const totalCost =
                                    quantity * newValue * unitCost;

                                  form.setValue(
                                    `product_preparations.${index}.total_cost`,
                                    totalCost,
                                  );
                                  calculateTotalCost();
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground">
                          $
                          {(
                            (form.watch(
                              `product_preparations.${index}.quantity`,
                            ) || 0) *
                            (form.watch(
                              `product_preparations.${index}.base_to_recipe`,
                            ) || 0) *
                            (form.watch(
                              `product_preparations.${index}.unit_cost`,
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
                            "product_preparations",
                          );
                          form.setValue(
                            "product_preparations",
                            currentPreparations.filter((_, i) => i !== index),
                          );
                          calculateTotalCost();
                        }}
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
              <Button type="submit">
                {product ? "Save changes" : "Create recipe"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
