import { useState } from "react";
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

const defaultCategories = [
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
  const [ingredientCount, setIngredientCount] = useState(1);

  const form = useForm<Recipe>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      portionCount: 1,
      ingredients: [{ name: "", quantity: 0, unit: "g" }],
      category: defaultCategories[0],
    },
  });

  React.useEffect(() => {
    if (recipe) {
      form.reset({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        portionCount: recipe.portionCount || 1,
        ingredients: recipe.ingredients,
        price: recipe.price,
        cost: recipe.cost,
      });
    }
  }, [recipe, form]);

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
                    <FormControl>
                      <CreatableSelect
                        value={[field.value]}
                        onChange={(value) => {
                          if (typeof value === 'string') {
                            // Handle new category creation
                            const emoji = '🍽️'; // Default emoji for new categories
                            field.onChange({
                              value: value.toLowerCase(),
                              label: value,
                              emoji,
                            });
                          } else {
                            field.onChange(value[0]);
                          }
                        }}
                        onCreateOption={(inputValue) => {
                          const emoji = '🍽️'; // Default emoji for new categories
                          field.onChange({
                            value: inputValue.toLowerCase(),
                            label: inputValue,
                            emoji,
                          });
                        }}
                        options={defaultCategories}
                        formatOptionLabel={(option) => (
                          <div className="flex items-center gap-2">
                            <span>{option.emoji}</span>
                            <span>{option.label}</span>
                          </div>
                        )}
                        placeholder="Select or create category"
                      />
                    </FormControl>
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
                  onClick={() => {
                    const currentIngredients = form.getValues("ingredients") || [];
                    form.setValue("ingredients", [
                      ...currentIngredients,
                      { name: "", quantity: 0, unit: "g" },
                    ]);
                    setIngredientCount(prev => prev + 1);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>

              {Array.from({ length: ingredientCount }).map((_, index) => (
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
                          <CreatableSelect
                            value={[field.value]}
                            onChange={values => field.onChange(values[0])}
                            onCreateOption={field.onChange}
                            placeholder="Select or add ingredient"
                            options={[
                              { value: 'tomatoes', label: 'Tomatoes' },
                              { value: 'flour', label: 'Flour' },
                              { value: 'sugar', label: 'Sugar' },
                              { value: 'salt', label: 'Salt' },
                              { value: 'olive oil', label: 'Olive Oil' },
                            ]}
                          />
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

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.conversionFactor`}
                    render={({ field }) => (
                      <FormItem className="w-24">
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
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mb-2"
                      onClick={() => {
                        const currentIngredients = form.getValues("ingredients");
                        form.setValue(
                          "ingredients",
                          currentIngredients.filter((_, i) => i !== index)
                        );
                        setIngredientCount(prev => prev - 1);
                      }}
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
