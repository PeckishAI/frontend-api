import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreatableSelect } from "@/components/ui/creatable-select";
import type { InventoryItem } from "@/lib/types";

const editIngredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  parLevel: z.number().min(0, "Par level must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  suppliers: z.array(z.object({
    supplierId: z.string(),
    supplierName: z.string(),
    unitCost: z.number().min(0),
    packSize: z.string(),
  })).min(1, "At least one supplier is required"),
});

type EditIngredientFormValues = z.infer<typeof editIngredientSchema>;

interface EditIngredientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: InventoryItem;
  onSubmit: (data: EditIngredientFormValues) => void;
}

const defaultUnits = [
  { value: 'kg', label: 'Kilogram (kg)', category: 'Weight' },
  { value: 'g', label: 'Gram (g)', category: 'Weight' },
  { value: 'l', label: 'Liter (L)', category: 'Volume' },
  { value: 'ml', label: 'Milliliter (mL)', category: 'Volume' },
  { value: 'pcs', label: 'Pieces', category: 'Count' },
  { value: 'box', label: 'Box', category: 'Container' },
  { value: 'case', label: 'Case', category: 'Container' },
];

export default function EditIngredientForm({
  open,
  onOpenChange,
  ingredient,
  onSubmit,
}: EditIngredientFormProps) {
  const form = useForm<EditIngredientFormValues>({
    resolver: zodResolver(editIngredientSchema),
    defaultValues: ingredient ? {
      ...ingredient,
      parLevel: Number(ingredient.parLevel),
      quantity: Number(ingredient.quantity),
    } : {
      name: '',
      tags: [],
      parLevel: 0,
      quantity: 0,
      unit: '',
      suppliers: [],
    },
  });

  const handleSubmit = (values: EditIngredientFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{ingredient ? 'Edit' : 'Add'} Ingredient</SheetTitle>
          <SheetDescription>
            Make changes to the ingredient here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <CreatableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={[]}
                      onCreateOption={(value) => field.onChange([...field.value, value])}
                      placeholder="Select or create tags"
                      multiple={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Par Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <CreatableSelect
                      value={[field.value]}
                      onChange={values => field.onChange(values[0])}
                      options={defaultUnits}
                      onCreateOption={field.onChange}
                      placeholder="Select or create unit"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
