
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { inventoryService } from "@/services/inventoryService";
import { menuService } from "@/services/menuService";
import { unitService } from "@/services/unitService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";

const preparationSchema = z.object({
  preparation_name: z.string().min(1, "Name is required"),
  portion_count: z.number().min(1, "Must be at least 1"),
  preparation_ingredients: z.array(
    z.object({
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
    })
  ).optional(),
});

export default function PreparationModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}) {
  const form = useForm({
    resolver: zodResolver(preparationSchema),
    defaultValues: {
      preparation_name: "",
      portion_count: 1,
      preparation_ingredients: [],
    },
  });

  const [showNewIngredientDialog, setShowNewIngredientDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const { currentRestaurant } = useRestaurantContext();
  const queryClient = useQueryClient();

  const ingredients = form.watch("preparation_ingredients") || [];

  const { data: restaurantIngredients } = useQuery({
    queryKey: ["ingredients", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return inventoryService.getRestaurantIngredients(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const { data: units } = useQuery({
    queryKey: ["units", currentRestaurant?.restaurant_uuid],
    queryFn: async () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      const [referenceUnits, restaurantUnits] = await Promise.all([
        unitService.getReferenceUnit(),
        unitService.getRestaurantUnit(currentRestaurant.restaurant_uuid),
      ]);
      return [...referenceUnits, ...restaurantUnits];
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

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
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("preparation_ingredients");
    form.setValue(
      "preparation_ingredients",
      currentIngredients.filter((_, i) => i !== index),
    );
  };

  const ingredientOptions = restaurantIngredients
    ? Object.values(restaurantIngredients).map((ing: any) => ({
        label: ing.ingredient_name,
        value: ing.ingredient_uuid,
      }))
    : [];

  const unitOptions = units
    ? units.map((unit: any) => ({
        label: unit.unit_name,
        value: unit.unit_uuid,
      }))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Preparation</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="portion_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portions</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recipe Components</h3>
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

              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end"
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
                              }
                            }}
                            options={ingredientOptions}
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
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
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
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Unit
                        </FormLabel>
                        <FormControl>
                          <CreatableSelect
                            value={
                              field.value
                                ? {
                                    value: field.value,
                                    label:
                                      ingredients[index]?.recipe_unit?.unit_name ||
                                      field.value,
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
                            options={unitOptions}
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
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
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
                    onClick={() => removeIngredient(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create preparation</Button>
            </div>
          </form>
        </Form>

        <NewIngredientDialog
          open={showNewIngredientDialog}
          onOpenChange={setShowNewIngredientDialog}
          defaultName={newItemName}
          onSubmit={async (data) => {
            try {
              if (!currentRestaurant?.restaurant_uuid) return;
              await inventoryService.createIngredient(
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
      </DialogContent>
    </Dialog>
  );
}
