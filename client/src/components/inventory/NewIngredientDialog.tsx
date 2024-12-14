import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { defaultUnits } from "@/lib/data";

const newIngredientSchema = z.object({
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

type NewIngredientFormValues = z.infer<typeof newIngredientSchema>;

interface NewIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewIngredientFormValues) => void;
}

export default function NewIngredientDialog({
  open,
  onOpenChange,
  onSubmit,
}: NewIngredientDialogProps) {
  const form = useForm<NewIngredientFormValues>({
    resolver: zodResolver(newIngredientSchema),
    defaultValues: {
      name: '',
      tags: [],
      parLevel: 0,
      quantity: 0,
      unit: '',
      suppliers: [],
    },
  });

  const handleSubmit = (values: NewIngredientFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Ingredient</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new ingredient to your inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
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
              <Button type="submit">Create ingredient</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
