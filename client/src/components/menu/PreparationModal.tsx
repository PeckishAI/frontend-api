
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { type Preparation } from "@/types/menu";

const preparationSchema = z.object({
  preparation_name: z.string().min(1, "Name is required"),
});

export default function PreparationModal({
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
  const form = useForm<z.infer<typeof preparationSchema>>({
    resolver: zodResolver(preparationSchema),
    defaultValues: {
      preparation_name: preparation?.preparation_name || "",
    },
  });

  const { currentRestaurant } = useRestaurantContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{preparation ? "Edit" : "New"} Preparation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
