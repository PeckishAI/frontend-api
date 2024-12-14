import * as React from "react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const units = ["g", "kg", "ml", "l", "unit", "oz", "lb"] as const;

const ingredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.enum(units),
  conversionFactor: z.number().optional(),
});

const categorySchema = z.object({
  value: z.string(),
  label: z.string(),
  emoji: z.string(),
});

const recipeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Recipe name is required"),
  category: categorySchema,
  portionCount: z.number().min(1, "Must have at least 1 portion"),
  ingredients: z.array(ingredientSchema).min(1, "Must have at least 1 ingredient"),
  price: z.number().optional(),
  cost: z.number().optional(),
});

export const defaultCategories = [
  { value: 'pizza', label: 'Pizza', emoji: '🍕' },
  { value: 'pasta', label: 'Pasta', emoji: '🍝' },
  { value: 'salad', label: 'Salads', emoji: '🥗' },
  { value: 'dessert', label: 'Desserts', emoji: '🍰' },
  { value: 'beverage', label: 'Beverages', emoji: '🥤' },
  { value: 'main', label: 'Main Course', emoji: '🍖' },
  { value: 'appetizer', label: 'Appetizers', emoji: '🥪' },
];

type Recipe = z.infer<typeof recipeSchema>;

export default function RecipeSheet({
  open,
  onOpenChange,
  recipe,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe?: Recipe;
  onSubmit: (data: Recipe) => void;
}) {
  const form = useForm<Recipe>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      category: defaultCategories[0],
      portionCount: 1,
      ingredients: [{ name: "", quantity: 0, unit: "g" }],
    },
  });

  React.useEffect(() => {
    if (recipe) {
      form.reset(recipe);
    }
  }, [recipe, form]);

  const ingredients = form.watch("ingredients") || [];

  const addIngredient = () => {
    const currentIngredients = form.getValues("ingredients") || [];
    form.setValue("ingredients", [
      ...currentIngredients,
      { name: "", quantity: 0, unit: "g" },
    ]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("ingredients");
    form.setValue(
      "ingredients",
      currentIngredients.filter((_, i) => i !== index)
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px]">
        <SheetHeader className="mb-5">
          <SheetTitle>
            {recipe ? "Edit Recipe" : "New Recipe"}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value.value}
                      onValueChange={(value) => {
                        const category = defaultCategories.find((c) => c.value === value) || {
                          value,
                          label: value,
                          emoji: '🍽️'
                        };
                        field.onChange(category);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <span>{field.value.emoji}</span>
                              <span>{field.value.label}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {defaultCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <span>{category.emoji}</span>
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="portionCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Portions</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Ingredients</h3>
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
                <div key={index} className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ingredient name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.unit`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Unit
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {recipe ? "Save Changes" : "Create Recipe"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}