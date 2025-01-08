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
import { type Preparation } from "@/types/menu";
import { inventoryService } from "@/services/inventoryService";
import { menuService } from "@/services/menuService";
import { unitService } from "@/services/unitService";
import { foodEmojis } from "@/lib/emojis";
import { categoryService } from "@/services/categoryService";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";
import CategoryModal from "./CategoryModal";

const preparationSchema = z.object({
  preparation_name: z.string().min(1, "Name is required"),
  category: z.object({
    category_uuid: z.string().optional(),
    category_name: z.string(),
    emoji: z.string(),
  }),
  unit: z.object({
    unit_uuid: z.string(),
    unit_name: z.string(),
  }),
  portion_count: z.number().min(1, "Portion count must be at least 1"),
  portion_cost: z.number().min(0, "Portion cost must be at least 0").optional(),
  preparation_ingredients: z.array(
    z.object({
      ingredient_uuid: z.string(),
      ingredient_name: z.string(),
      quantity: z.number().min(0),
      base_unit: z.object({
        unit_uuid: z.string(),
        unit_name: z.string(),
      }),
      recipe_unit: z.object({
        unit_uuid: z.string(),
        unit_name: z.string(),
      }),
      base_to_recipe: z.number(),
    }),
  ),
  preparation_preparations: z.array(
    z.object({
      preparation_uuid: z.string(),
      preparation_name: z.string(),
      quantity: z.number().min(0),
      base_unit: z.object({
        unit_uuid: z.string(),
        unit_name: z.string(),
      }),
      recipe_unit: z.object({
        unit_uuid: z.string(),
        unit_name: z.string(),
      }),
      base_to_recipe: z.number(),
    }),
  ),
});

type PreparationFormData = z.infer<typeof preparationSchema>;

const usePreparationOptions = (restaurantUuid?: string) => {
  const { data: preparations } = useQuery({
    queryKey: ["preparations", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      return menuService.getRestaurantPreparations(restaurantUuid);
    },
    enabled: !!restaurantUuid,
  });

  return preparations
    ? preparations.map((prep: any) => ({
        label: prep.preparation_name,
        value: prep.preparation_uuid,
        type: "preparation",
        unit_cost: prep.portion_cost || 0,
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

export default function PreparationModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PreparationFormData) => void;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNewIngredientDialog, setShowNewIngredientDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { currentRestaurant } = useRestaurantContext();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", currentRestaurant?.restaurant_uuid],
    queryFn: async () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return categoryService.getRestaurantCategories(
        currentRestaurant?.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return inventoryService.getRestaurantIngredients(
        currentRestaurant?.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const form = useForm<PreparationFormData>({
    resolver: zodResolver(preparationSchema),
    defaultValues: {
      portion_count: 1,
      preparation_ingredients: [],
      preparation_preparations: [],
    },
  });

  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (Object.keys(form.formState.errors).length > 0) {
        console.log("Form validation errors:", form.formState.errors);
        console.log("Current form values:", form.getValues());
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
      },
    ]);
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
        base_unit: { unit_uuid: "", unit_name: "" },
        recipe_unit: { unit_uuid: "", unit_name: "" },
        base_to_recipe: 1,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("preparation_ingredients");
    form.setValue(
      "preparation_ingredients",
      currentIngredients.filter((_, i) => i !== index),
    );
  };

  const removePreparation = (index: number) => {
    const currentPreparations = form.getValues("preparation_preparations");
    form.setValue(
      "preparation_preparations",
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
                <DialogTitle>Create New Preparation</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(async (data) => {
                    try {
                      // Validate required fields
                      if (!data.preparation_name) {
                        form.setError("preparation_name", {
                          type: "required",
                          message: "Name is required",
                        });
                        return;
                      }

                      if (!data.category) {
                        form.setError("category", {
                          type: "required",
                          message: "Category is required",
                        });
                        return;
                      }

                      if (!data.unit) {
                        form.setError("unit", {
                          type: "required",
                          message: "Unit is required",
                        });
                        return;
                      }

                      // Validate ingredients/preparations have required fields
                      const hasInvalidIngredients =
                        data.preparation_ingredients?.some(
                          (ing) =>
                            !ing.ingredient_uuid ||
                            !ing.quantity ||
                            !ing.recipe_unit,
                        );

                      if (hasInvalidIngredients) {
                        console.error("Invalid ingredients data");
                        return;
                      }

                      const hasInvalidPreparations =
                        data.preparation_preparations?.some(
                          (prep) =>
                            !prep.preparation_uuid ||
                            !prep.quantity ||
                            !prep.recipe_unit,
                        );

                      if (hasInvalidPreparations) {
                        console.error("Invalid preparations data");
                        return;
                      }

                      console.log("Form data being submitted:", data);
                      await onSubmit(data);
                      form.reset();
                      onOpenChange(false);
                    } catch (error) {
                      console.error("Error submitting form:", error);
                    }
                  })}
                  className="space-y-6 pt-6"
                >
                  <FormField
                    control={form.control}
                    name="preparation_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-5 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Category</FormLabel>
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
                              options={categories.map((cat) => ({
                                value: cat.category_uuid,
                                label: `${cat.emoji} ${cat.category_name}`,
                              }))}
                              onChange={(option) => {
                                if (option) {
                                  const selectedCategory = categories.find(
                                    (cat) => cat.category_uuid === option.value,
                                  );
                                  if (selectedCategory) {
                                    form.setValue("category", {
                                      category_uuid:
                                        selectedCategory.category_uuid,
                                      category_name:
                                        selectedCategory.category_name,
                                      emoji: selectedCategory.emoji,
                                    });
                                  }
                                }
                              }}
                              onCreateOption={(inputValue) => {
                                setNewItemName(inputValue);
                                setShowCategoryModal(true);
                              }}
                              placeholder=""
                              size="large"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portion_count"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
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
                      name="unit"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
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
                              size="small"
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
                        .watch("preparation_ingredients")
                        ?.map((_, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end"
                          >
                            <FormField
                              control={form.control}
                              name={`preparation_ingredients.${index}.ingredient_name`}
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
                                                `preparation_ingredients.${index}.ingredient_uuid`,
                                              ),
                                            }
                                          : null
                                      }
                                      options={
                                        ingredients?.map((ing: any) => ({
                                          label: ing.ingredient_name,
                                          value: ing.ingredient_uuid,
                                        })) || []
                                      }
                                      onChange={async (option) => {
                                        if (option) {
                                          const selectedIngredient =
                                            ingredients?.find(
                                              (ing: any) =>
                                                ing.ingredient_uuid ===
                                                option.value,
                                            );

                                          field.onChange(option.label);
                                          form.setValue(
                                            `preparation_ingredients.${index}.ingredient_uuid`,
                                            option.value,
                                          );

                                          if (selectedIngredient?.base_unit) {
                                            form.setValue(
                                              `preparation_ingredients.${index}.base_unit`,
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
                                              `preparation_ingredients.${index}.recipe_unit`,
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
                                                  `preparation_ingredients.${index}.base_to_recipe`,
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
                                        }
                                      }}
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
                              name={`preparation_ingredients.${index}.recipe_unit.unit_uuid`}
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
                                        form.watch(
                                          `preparation_ingredients.${index}.recipe_unit`,
                                        )
                                          ? {
                                              value: form.watch(
                                                `preparation_ingredients.${index}.recipe_unit.unit_uuid`,
                                              ),
                                              label: form.watch(
                                                `preparation_ingredients.${index}.recipe_unit.unit_name`,
                                              ),
                                            }
                                          : null
                                      }
                                      onChange={async (option) => {
                                        if (option) {
                                          form.setValue(
                                            `preparation_ingredients.${index}.recipe_unit`,
                                            {
                                              unit_uuid: option.value,
                                              unit_name: option.label,
                                            },
                                          );

                                          // Get the current ingredient and its base unit
                                          const ingredientUuid = form.watch(
                                            `preparation_ingredients.${index}.ingredient_uuid`,
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
                                                `preparation_ingredients.${index}.base_to_recipe`,
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
                                        const newUnit =
                                          await unitService.createUnit(
                                            { unit_name: inputValue },
                                            currentRestaurant.restaurant_uuid,
                                          );
                                        form.setValue(
                                          `preparation_ingredients.${index}.recipe_unit`,
                                          {
                                            unit_uuid: newUnit.unit_uuid,
                                            unit_name: newUnit.unit_name,
                                          },
                                        );
                                        queryClient.invalidateQueries([
                                          "units",
                                        ]);
                                      }}
                                      placeholder="Select unit"
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
                                    className={
                                      index !== 0 ? "sr-only" : undefined
                                    }
                                  >
                                    Factor
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      suffix={
                                        form.watch(
                                          `preparation_ingredients.${index}.base_unit.unit_name`,
                                        ) +
                                        " → " +
                                        form.watch(
                                          `preparation_ingredients.${index}.recipe_unit.unit_name`,
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
                                      }}
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
                        .watch("preparation_preparations")
                        ?.map((_, index) => (
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
                              name={`preparation_preparations.${index}.recipe_unit.unit_uuid`}
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
                                          if (
                                            !currentRestaurant?.restaurant_uuid
                                          )
                                            return;
                                          const newUnit =
                                            await unitService.createUnit(
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
                    <Button type="submit">Create Preparation</Button>
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
          const newIngredient = await inventoryService.createIngredient(
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
          console.log("Category", data);
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
