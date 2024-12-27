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
      product_ingredients: [],
      ...(preparation || {}),
    };
    form.reset(defaultValues);
  }, [preparation, form]);

  const ingredients = form.watch("preparation_ingredients") || [];
  const preparations = form.watch("preparation_preparations") || [];

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

  const calculateTotalCost = () => {
    const ingredients = form.getValues("preparation_ingredients") || [];
    const preparations = form.getValues("preparation_preparations") || [];

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-12"
                        onClick={() => setShowEmojiPicker(true)}
                      >
                        {field.value?.emoji}
                      </Button>
                      <Select
                        value={field.value?.emoji}
                        onValueChange={(value) => {
                          const category = defaultCategories.find(
                            (c) => c.value === value,
                          ) || {
                            value,
                            label: value,
                            emoji: field.value?.emoji,
                          };
                          field.onChange(category);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue>
                              <span>{field.value?.category_name}</span>
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {defaultCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              <div className="flex items-center gap-2">
                                <span>{category.emoji}</span>
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
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

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Recipe Components</h3>
                  <div className="flex gap-2"></div>
                </div>
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
                  name={`preparation_ingredients.${index}.ingredient_name`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Name</FormLabel>}
                      <FormControl>
                        <CreatableSelect
                          value={
                            field.value
                              ? {
                                  value: ingredient.ingredient_uuid || "",
                                  label: field.value,
                                }
                              : null
                          }
                          onChange={(option) => {
                            if (option) {
                              field.onChange(option.label);
                              form.setValue(
                                `preparation_ingredients.${index}.ingredient_uuid`,
                                option.value,
                              );
                              form.setValue(
                                `preparation_ingredients.${index}.unit_cost`,
                                option.unit_cost || 0,
                              );
                              const quantity = form.watch(`preparation_ingredients.${index}.quantity`) || 0;
                              const conversionFactor = form.watch(`preparation_ingredients.${index}.base_to_recipe`) || 1;
                              form.setValue(
                                `preparation_ingredients.${index}.total_cost`,
                                quantity * conversionFactor * (option.unit_cost || 0),
                              );
                              calculateTotalCost();
                            }
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
                                  label:
                                    ingredients[index]?.recipe_unit
                                      ?.unit_name || field.value,
                                }
                              : null
                          }
                          onChange={(option) => {
                            if (option) {
                              form.setValue(
                                `preparation_ingredients.${index}.recipe_unit`,
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
                              if (!currentRestaurant?.restaurant_uuid) return;
                              const newUnit = await unitService.createUnit(
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
                              console.error("Failed to create unit:", error);
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
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
                        `preparation_ingredients.${index}.quantity`,
                      ) || 0) *
                      (form.watch(
                        `preparation_ingredients.${index}.unit_cost`,
                      ) || 0)
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
            ))}

            {preparations.map((preparation, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-4 items-end"
              >
                <FormField
                  control={form.control}
                  name={`preparation_preparations.${index}.preparation_name`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 &&
                        preparations.preparation_ingredients &&
                        preparations.preparation_ingredients.length > 0 && (
                          <FormLabel>Name</FormLabel>
                        )}
                      <FormControl>
                        <CreatableSelect
                          value={
                            field.value
                              ? {
                                  value: preparation.preparation_uuid || "",
                                  label: field.value,
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
                              form.setValue(
                                `preparation_preparations.${index}.unit_cost`,
                                option.unit_cost || 0,
                              );

                              const quantity = form.watch(
                                `preparation_preparations.${index}.quantity`,
                              ) || 0;
                              const conversionFactor = form.watch(
                                `preparation_preparations.${index}.base_to_recipe`,
                              ) || 1;

                              form.setValue(
                                `preparation_preparations.${index}.total_cost`,
                                quantity * conversionFactor * (option.unit_cost || 0),
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
                  name={`preparation_preparations.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      {preparations.preparation_ingredients &&
                        preparations.preparation_ingredients.length > 0 && (
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Quantity
                          </FormLabel>
                        )}
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          {...field}
                          onChange={(e) => {
                            const newQuantity = parseFloat(e.target.value);
                            field.onChange(newQuantity);

                            const unitCost =
                              form.watch(
                                `preparation_preparations.${index}.unit_cost`,
                              ) || 0;
                            const conversionFactor =
                              form.watch(
                                `preparation_preparations.${index}.base_to_recipe`,
                              ) || 1;
                            const totalCost =
                              newQuantity * conversionFactor * unitCost;
                            form.setValue(
                              `preparation_preparations.${index}.total_cost`,
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
                  name={`preparation_preparations.${index}.recipe_unit.unit_uuid`}
                  render={({ field }) => (
                    <FormItem>
                      {preparations.preparation_ingredients &&
                        preparations.preparation_ingredients.length > 0 && (
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Unit
                          </FormLabel>
                        )}
                      <FormControl>
                        <CreatableSelect
                          value={
                            field.value
                              ? {
                                  value: field.value,
                                  label:
                                    preparations[index]?.recipe_unit
                                      ?.unit_name || field.value,
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
                              if (!currentRestaurant?.restaurant_uuid) return;
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
                              console.error("Failed to create unit:", error);
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
                      {preparations.preparation_ingredients &&
                        preparations.preparation_ingredients.length > 0 && (
                          <FormLabel
                            className={index !== 0 ? "sr-only" : undefined}
                          >
                            Factor
                          </FormLabel>
                        )}
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
                                `preparation_preparations.${index}.quantity`,
                              ) || 0;
                            const unitCost =
                              form.watch(
                                `preparation_preparations.${index}.unit_cost`,
                              ) || 0;
                            const totalCost = quantity * newValue * unitCost;
                            form.setValue(
                              `preparation_preparations.${index}.total_cost`,
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
                      form.watch(
                        `preparation_preparations.${index}.total_cost`,
                      ) || 0
                    ).toFixed(2)}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentPreparations = form.getValues(
                      "preparation_preparations",
                    );
                    form.setValue(
                      "preparation_preparations",
                      currentPreparations.filter((_, i) => i !== index),
                    );
                    calculateTotalCost();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
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
      </SheetContent>
    </Sheet>
  );
}