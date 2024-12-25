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

export const defaultCategories = [
  { value: "mains", label: "Main Dishes", emoji: "🍽️" },
  { value: "starters", label: "Starters", emoji: "🥗" },
  { value: "desserts", label: "Desserts", emoji: "🍰" },
  { value: "drinks", label: "Drinks", emoji: "🥤" },
  { value: "sides", label: "Side Dishes", emoji: "🥨" },
];

const useIngredientAndPrepOptions = (restaurantUuid?: string) => {
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

  const { data: preparations } = useQuery({
    queryKey: ["preparations", restaurantUuid],
    queryFn: async () => {
      if (!restaurantUuid) return [];
      const data = await menuService.getRestaurantPreparations(restaurantUuid);
      return data;
    },
    enabled: !!restaurantUuid,
  });

  const options = [
    {
      label: "Ingredients",
      options: ingredients
        ? Object.values(ingredients).map((ing: any) => ({
            label: ing.ingredient_name,
            value: ing.ingredient_uuid,
            type: "ingredient",
          }))
        : [],
    },
    {
      label: "Preparations",
      options: preparations
        ? preparations.map((prep: any) => ({
            label: prep.preparation_name,
            value: prep.preparation_uuid,
            type: "preparation",
          }))
        : [],
    },
  ];

  return options;
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

  const addIngredient = () => {
    const currentIngredients = form.getValues("product_ingredients") || [];
    form.setValue("product_ingredients", [
      ...currentIngredients,
      { ingredient_name: "", quantity: 0, unit: "g", conversionFactor: 1 },
    ]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("product_ingredients");
    form.setValue(
      "product_ingredients",
      currentIngredients.filter((_, i) => i !== index),
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

                //const productData = {
                //  product_uuid: product?.product_uuid,
                //  product_name: data.product_name,
                //  portion_count: data.portion_count,
                //  portion_price: data.portion_price,
                //  portion_cost: data.portion_cost,
                //  product_ingredients: data.product_ingredients.map((ing) => ({
                //    ingredient_uuid: ing.ingredient_uuid || undefined,
                //    ingredient_name: ing.ingredient_name,
                //    quantity: ing.quantity,
                //    recipe_unit: {
                //      unit_name: ing.recipe_unit.unit_name,
                //    },
                //  })),
                //};

                if (product) {
                  await menuService.updateProduct(
                    currentRestaurant.restaurant_uuid,
                    product,
                  );
                } else {
                  await menuService.createProduct(
                    currentRestaurant.restaurant_uuid,
                    product,
                  );
                }

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
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
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
              {/* Recipe Components Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Recipe Components</h3>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentPreparations =
                          form.getValues("product_preparations") || [];
                        form.setValue("product_preparations", [
                          ...currentPreparations,
                          { preparation_name: "", quantity: 0 },
                        ]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Preparation
                    </Button>
                  </div>
                </div>

                {/* Ingredients */}
                {ingredients.map((ingredient, index) => (
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
                              value={
                                field.value &&
                                (field.value.ingredient_uuid ||
                                  field.value.preparation_uuid)
                                  ? {
                                      value:
                                        field.value.ingredient_uuid ||
                                        field.value.preparation_uuid ||
                                        "",
                                      label:
                                        field.value.ingredient_name ||
                                        field.value.preparation_name ||
                                        "",
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  const isPreparation =
                                    option.type === "preparation";
                                  field.onChange({
                                    [isPreparation
                                      ? "preparation_uuid"
                                      : "ingredient_uuid"]: option.value,
                                    [isPreparation
                                      ? "preparation_name"
                                      : "ingredient_name"]: option.label,
                                  });
                                }
                              }}
                              options={useIngredientAndPrepOptions(
                                currentRestaurant?.restaurant_uuid,
                              )}
                              onCreateOption={(value) => {
                                field.onChange({
                                  id: value.toLowerCase(),
                                  name: value,
                                });
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
                                  field.onChange(option.value);
                                }
                              }}
                              options={useUnitOptions(
                                currentRestaurant?.restaurant_uuid,
                              )}
                              onCreateOption={(value) => {
                                field.onChange(value);
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
                            `product_ingredients.${index}.quantity`,
                          ) || 0) *
                          (form.watch(
                            `product_ingredients.${index}.base_to_recipe`,
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
              </div>

              {/* Preparations */}
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
                                      value: preparation.preparation_uuid || "",
                                      label: field.value || "",
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
                                field.value
                                  ? {
                                      value: field.value,
                                      label:
                                        preparation.recipe_unit?.unit_name ||
                                        field.value,
                                    }
                                  : null
                              }
                              onChange={(option) => {
                                if (option) {
                                  field.onChange(option.value);
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
                            `product_preparations.${index}.quantity`,
                          ) || 0) *
                          (form.watch(
                            `product_preparations.${index}.base_to_recipe`,
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
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              )}
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
