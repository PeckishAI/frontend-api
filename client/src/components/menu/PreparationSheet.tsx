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
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { foodEmojis } from "@/lib/emojis";
import { defaultCategories } from "./ProductSheet";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";

const preparationSchema = z.object({
  preparation_uuid: z.string().optional(),
  preparation_name: z.string().min(1, "Name is required"),
  category: z
    .object({
      category_uuid: z.string().optional(),
      category_name: z.string().optional(),
      emoji: z.string().optional(),
    })
    .optional(),
  portion_count: z.number().min(1, "Portion count must be at least 1"),
  portion_cost: z.number().optional(),
  preparation_ingredients: z
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
  preparation_preparations: z
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

type Preparation = z.infer<typeof preparationSchema>;

const useIngredientOptions = (restaurantUuid?: string) => {
  const { data: ingredients } = useQuery({
    queryKey: ["ingredients", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      return inventoryService.getRestaurantIngredients(restaurantUuid);
    },
    enabled: !!restaurantUuid,
  });

  return ingredients
    ? Object.values(ingredients).map((ing: any) => ({
        label: ing.ingredient_name,
        value: ing.ingredient_uuid,
        type: "ingredient",
      }))
    : [];
};

const usePreparationOptions = (restaurantUuid?: string) => {
  const { data: preparations } = useQuery({
    queryKey: ["preparations", restaurantUuid],
    queryFn: () => {
      if (!restaurantUuid) return [];
      return menuService.getRestaurantPreparations(restaurantUuid);
    },
  });
  return preparations || [];
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

  if (!units) return [];

  const allUnits = units.map((unit: any) => ({
    label: unit.unit_name,
    value: unit.unit_uuid,
  }));

  return allUnits;
};

export default function PreparationSheet({
  open,
  onOpenChange,
  preparation,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preparation?: Preparation;
  onSubmit: (data: Preparation) => void;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { currentRestaurant } = useRestaurantContext();
  const queryClient = useQueryClient();
  const [showNewIngredientDialog, setShowNewIngredientDialog] = useState(false);
  const [showNewPreparationDialog, setShowNewPreparationDialog] =
    useState(false);
  const [newItemName, setNewItemName] = useState("");

  const form = useForm<Preparation>({
    resolver: zodResolver(preparationSchema),
    defaultValues: {
      portion_count: 1,
      ...(preparation || {}),
    },
  });

  React.useEffect(() => {
    const defaultValues = {
      portion_count: 1,
      preparation_ingredients: [],
      ...(preparation || {}),
    };
    form.reset(defaultValues);
  }, [preparation, form]);

  const ingredients = form.watch("preparation_ingredients") || [];
  const preparations = form.watch("preparation_preparations") || [];
  const recipeComponents = [...ingredients, ...preparations];

  const addIngredient = () => {
    const currentIngredients = form.getValues("preparation_ingredients") || [];
    form.setValue("preparation_ingredients", [
      ...currentIngredients,
      {
        ingredient_uuid: "",
        ingredient_name: "",
        quantity: 0,
        base_unit: { unit_uuid: "", unit_name: "" },
        recipe_unit: { unit_uuid: "", unit_name: "" },
        base_to_recipe: 1,
        unit_cost: 0,
        total_cost: 0,
      },
    ]);
    calculateTotalCost();
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("preparation_ingredients");
    form.setValue(
      "preparation_ingredients",
      currentIngredients.filter((_, i) => i !== index),
    );
    calculateTotalCost();
  };

  const addPreparation = () => {
    const currentPreparations =
      form.getValues("preparation_preparations") || [];
    form.setValue("preparation_preparations", [
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

  const removePreparation = (index: number) => {
    const currentPreparations = form.getValues("preparation_preparations");
    form.setValue(
      "preparation_preparations",
      currentPreparations.filter((_, i) => i !== index),
    );
    calculateTotalCost();
  };

  const calculateTotalCost = () => {
    const ingredients = form.getValues("preparation_ingredients") || [];
    const preparations = form.getValues("preparation_preparations") || [];

    const totalIngredientCost = ingredients.reduce((sum, ing) => {
      const quantity = ing.quantity || 0;
      const unitCost = ing.unit_cost || 0;
      const conversionFactor = ing.base_to_recipe || 1;
      return sum + (quantity * unitCost * conversionFactor);
    }, 0);

    const totalPrepCost = preparations.reduce((sum, prep) => {
      const quantity = prep.quantity || 0;
      const unitCost = prep.unit_cost || 0;
      const conversionFactor = prep.base_to_recipe || 1;
      return sum + (quantity * unitCost * conversionFactor);
    }, 0);

    const totalCost = totalIngredientCost + totalPrepCost;
    const portionCount = form.getValues("portion_count") || 1;

    form.setValue("portion_cost", totalCost / portionCount);

    // Update individual total costs
    ingredients.forEach((ing, index) => {
      const totalCost = (ing.quantity || 0) * (ing.unit_cost || 0) * (ing.base_to_recipe || 1);
      form.setValue(`preparation_ingredients.${index}.total_cost`, totalCost);
    });

    preparations.forEach((prep, index) => {
      const totalCost = (prep.quantity || 0) * (prep.unit_cost || 0) * (prep.base_to_recipe || 1);
      form.setValue(`preparation_preparations.${index}.total_cost`, totalCost);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px] h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{preparation ? "Edit" : "New"} Preparation</SheetTitle>
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
                console.error("Failed to save preparation:", error);
              }
            })}
            className="space-y-6 pt-8"
          >
            <FormField
              control={form.control}
              name="preparation_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="category"
                render={({ field }) => {
                  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="portion_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <CreatableSelect
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
                        options={useUnitOptions(
                          currentRestaurant?.restaurant_uuid,
                        )}
                        onCreateOption={(inputValue) => {
                          setNewItemName(inputValue);
                        }}
                        placeholder=""
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
            </div>

            <div className="space-y-8">
              {/* Ingredients Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Ingredients</h3>
                </div>

                {ingredients.map((component, index) => {
                  const fieldPrefix = "preparation_ingredients";
                  const nameField = "ingredient_name";
                  console.log("ingredient: ", component);
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-4 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`preparation_ingredients.${index}.ingredient_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={index !== 0 ? "sr-only" : undefined}
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
                                          `preparation_ingredients.${index}.ingredient_uuid`,
                                        ),
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
                        name={`preparation_ingredients.${index}.quantity`}
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
                                    form.watch("preparation_ingredients") || [];
                                  const preparations =
                                    form.watch("preparation_preparations") ||
                                    [];
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
                        name={`preparation_ingredients.${index}.recipe_unit.unit_uuid`}
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
                                        label: form.watch(
                                          `preparation_ingredients.${index}.recipe_unit.unit_name`,
                                        ),
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
                                onCreateOption={async (value) => {
                                  try {
                                    if (!currentRestaurant?.restaurant_uuid)
                                      return;
                                    const newUnit =
                                      await unitService.createUnit(
                                        { unit_name: value },
                                        currentRestaurant.restaurant_uuid,
                                      );
                                    form.setValue(
                                      `preparation_ingredients.${index}.recipe_unit`,
                                      {
                                        unit_uuid: newUnit.unit_uuid,
                                        unit_name: newUnit.unit_name,
                                      },
                                    );
                                    queryClient.invalidateQueries(["units"]);
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
                        name={`preparation_ingredients.${index}.base_to_recipe`}
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
                                    form.watch("preparation_ingredients") || [];
                                  const preparations =
                                    form.watch("preparation_preparations") ||
                                    [];
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
                              `preparation_ingredients.${index}.total_cost`,
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

              {/* Preparations Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Preparations</h3>
                </div>

                {form.watch("preparation_preparations")?.map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end"
                  >
                    <FormField
                      control={form.control}
                      name={`preparation_preparations.${index}.preparation_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
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
                                        `preparation_preparations.${index}.preparation_uuid`,
                                      ),
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  field.onChange(option.label);
                                  form.setValue(
                                    `preparation_preparations.${index}.preparation_uuid`,
                                    option.value,
                                  );
                                }
                              }}
                              options={usePreparationOptions(
                                currentRestaurant?.restaurant_uuid,
                              )}
                              onCreateOption={(inputValue) => {
                                setNewItemName(inputValue);
                              }}
                              placeholder=""
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`preparation_preparations.${index}.quantity`}
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
                      name={`preparation_preparations.${index}.recipe_unit.unit_uuid`}
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
                                      label: form.watch(
                                        `preparation_preparations.${index}.recipe_unit.unit_name`,
                                      ),
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  form.setValue(
                                    `preparation_preparations.${index}.recipe_unit`,
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
                              onCreateOption={async (value) => {
                                try {
                                  if (!currentRestaurant?.restaurant_uuid)
                                    return;
                                  const newUnit = await unitService.createUnit(
                                    { unit_name: value },
                                    currentRestaurant.restaurant_uuid,
                                  );
                                  form.setValue(
                                    `preparation_preparations.${index}.recipe_unit`,
                                    {
                                      unit_uuid: newUnit.unit_uuid,
                                      unit_name: newUnit.unit_name,
                                    },
                                  );
                                  queryClient.invalidateQueries(["units"]);
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
                      name={`preparation_preparations.${index}.base_to_recipe`}
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
                      onClick={() => removePreparation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                {preparation ? "Save changes" : "Create preparation"}
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
