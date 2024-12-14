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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const defaultCategories = [
  { value: 'mains', label: 'Main Dishes', emoji: '🍽️' },
  { value: 'starters', label: 'Starters', emoji: '🥗' },
  { value: 'desserts', label: 'Desserts', emoji: '🍰' },
  { value: 'drinks', label: 'Drinks', emoji: '🥤' },
  { value: 'sides', label: 'Side Dishes', emoji: '🥨' },
];

const foodEmojis = [
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥨', '🥪', '🌮', '🌯',
  '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈',
  '🧀', '🥩', '🥓', '🍖', '🍗', '🥞', '🧇', '🥯', '🥖', '🥐',
  '🥨', '🥯', '🥖', '🫓', '🥨', '🥯', '🥖', '🥐', '🍞', '🥜',
  '🌰', '🥔', '🥕', '🌽', '🥑', '🥬', '🥒', '🥦', '🧄', '🧅',
  '🥜', '🍯', '🥫', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🌭',
  '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣',
];

const defaultIngredients = [
  { value: 'tomatoes', label: 'Tomatoes' },
  { value: 'flour', label: 'Flour' },
  { value: 'sugar', label: 'Sugar' },
  { value: 'salt', label: 'Salt' },
  { value: 'olive_oil', label: 'Olive Oil' },
  { value: 'onions', label: 'Onions' },
  { value: 'garlic', label: 'Garlic' },
  { value: 'pepper', label: 'Black Pepper' },
];

const defaultUnits = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'l', label: 'Liters (l)' },
  { value: 'pcs', label: 'Pieces' },
  { value: 'cup', label: 'Cups' },
  { value: 'tbsp', label: 'Tablespoons' },
  { value: 'tsp', label: 'Teaspoons' },
];

const recipeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.object({
    value: z.string(),
    label: z.string(),
    emoji: z.string(),
  }),
  portionCount: z.number().min(1, "Portion count must be at least 1"),
  ingredients: z.array(z.object({
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    conversionFactor: z.number().optional(),
  })).min(1, "At least one ingredient is required"),
  price: z.number().optional(),
  cost: z.number().optional(),
});

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const form = useForm<Recipe>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      category: defaultCategories[0],
      portionCount: 1,
      ingredients: [{ name: "", quantity: 0, unit: "g", conversionFactor: 1 }],
      price: 0,
      cost: 0,
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
      { name: "", quantity: 0, unit: "g", conversionFactor: 1 },
    ]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("ingredients");
    form.setValue(
      "ingredients",
      currentIngredients.filter((_, i) => i !== index)
    );
  };

  const getMarginPercentage = () => {
    const price = form.watch('price') || 0;
    const cost = form.watch('cost') || 0;
    if (price === 0) return 0;
    return ((price - cost) / price * 100).toFixed(2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px] h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{recipe ? "Edit" : "New"} Recipe</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-8">
            <FormField
              control={form.control}
              name="name"
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
                        {field.value.emoji}
                      </Button>
                      <Select
                        value={field.value.value}
                        onValueChange={(value) => {
                          const category = defaultCategories.find((c) => c.value === value) || {
                            value,
                            label: value,
                            emoji: field.value.emoji
                          };
                          field.onChange(category);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue>
                              <span>{field.value.label}</span>
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
                    </div>
                  </FormItem>
                )}
              />

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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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

              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-4 items-end">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Name
                        </FormLabel>
                        <FormControl>
                          <CreatableSelect
                            value={field.value ? [field.value] : []}
                            onChange={(values) => {
                              if (values[0]) {
                                field.onChange(values[0]);
                              }
                            }}
                            options={defaultIngredients}
                            onCreateOption={(value) => {
                              if (!field.value.includes(value)) {
                                field.onChange(value);
                              }
                            }}
                            placeholder="Select or add ingredient"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
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
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Unit
                        </FormLabel>
                        <FormControl>
                          <CreatableSelect
                            value={field.value ? [field.value] : []}
                            onChange={(values) => {
                              if (values[0]) {
                                field.onChange(values[0]);
                              }
                            }}
                            options={defaultUnits}
                            onCreateOption={(value) => {
                              if (!field.value.includes(value)) {
                                field.onChange(value);
                              }
                            }}
                            placeholder="Select unit"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.conversionFactor`}
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
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">
                      ${((form.watch(`ingredients.${index}.quantity`) || 0) * (form.watch(`ingredients.${index}.conversionFactor`) || 0)).toFixed(2)}
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

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {recipe ? "Save changes" : "Create recipe"}
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
