
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { type Preparation } from "@/types/menu";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import { foodEmojis } from "@/lib/emojis";
import { defaultCategories } from "./ProductSheet";

const preparationSchema = z.object({
  preparation_name: z.string().min(1, "Name is required"),
  category: z.object({
    category_name: z.string(),
    emoji: z.string(),
  }),
  portion_count: z.number().min(1, "Portion count must be at least 1"),
  preparation_ingredients: z.array(
    z.object({
      ingredient_uuid: z.string(),
      ingredient_name: z.string(),
      quantity: z.number().min(0),
      recipe_unit: z.object({
        unit_uuid: z.string(),
        unit_name: z.string(),
      }),
      base_to_recipe: z.number(),
    })
  ),
});

type PreparationFormData = z.infer<typeof preparationSchema>;

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
  const { currentRestaurant } = useRestaurantContext();

  const form = useForm<PreparationFormData>({
    resolver: zodResolver(preparationSchema),
    defaultValues: {
      portion_count: 1,
      preparation_ingredients: [],
    },
  });

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients", currentRestaurant?.restaurant_uuid],
    queryFn: async () => {
      if (!currentRestaurant?.restaurant_uuid) return [];
      return inventoryService.getRestaurantIngredients(
        currentRestaurant.restaurant_uuid
      );
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
        recipe_unit: { unit_uuid: "", unit_name: "" },
        base_to_recipe: 1,
      },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
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
                    <Input {...field} placeholder="Enter preparation name" />
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
                        value={field.value?.category_name}
                        onValueChange={(value) => {
                          const category = defaultCategories.find(
                            (c) => c.value === value
                          );
                          if (category) {
                            field.onChange({
                              category_name: category.label,
                              emoji: category.emoji,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
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
            </div>

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

              {form.watch("preparation_ingredients")?.map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end"
                >
                  <FormField
                    control={form.control}
                    name={`preparation_ingredients.${index}.ingredient_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Ingredient
                        </FormLabel>
                        <FormControl>
                          <CreatableSelect
                            value={
                              field.value
                                ? {
                                    label: field.value,
                                    value: form.watch(
                                      `preparation_ingredients.${index}.ingredient_uuid`
                                    ),
                                  }
                                : null
                            }
                            onChange={(option) => {
                              if (option) {
                                field.onChange(option.label);
                                form.setValue(
                                  `preparation_ingredients.${index}.ingredient_uuid`,
                                  option.value
                                );
                              }
                            }}
                            options={
                              ingredients
                                ? Object.values(ingredients).map((ing: any) => ({
                                    label: ing.ingredient_name,
                                    value: ing.ingredient_uuid,
                                  }))
                                : []
                            }
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
                                    label: form.watch(
                                      `preparation_ingredients.${index}.recipe_unit.unit_name`
                                    ),
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
                                  }
                                );
                              }
                            }}
                            options={
                              units
                                ? units.map((unit: any) => ({
                                    label: unit.unit_name,
                                    value: unit.unit_uuid,
                                  }))
                                : []
                            }
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

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const ingredients = form.getValues("preparation_ingredients");
                      form.setValue(
                        "preparation_ingredients",
                        ingredients.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Preparation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
