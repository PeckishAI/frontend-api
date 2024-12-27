
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
import { foodEmojis } from "@/lib/emojis";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const categorySchema = z.object({
  category_name: z.string().min(1, "Name is required"),
  emoji: z.string().min(1, "Emoji is required"),
});

type Category = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Category) => void;
  defaultValues?: {
    category_name?: string;
    emoji?: string;
  };
}

export default function CategoryModal({
  open,
  onOpenChange,
  onSubmit,
}: CategoryModalProps) {
  const form = useForm<Category>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category_name: defaultValues?.category_name || "",
      emoji: defaultValues?.emoji || "🍽️",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              try {
                onSubmit(data);
                onOpenChange(false);
              } catch (error) {
                console.error("Failed to create category:", error);
              }
            })}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Emoji</FormLabel>
                  <ScrollArea className="h-[200px]">
                    <div className="grid grid-cols-8 gap-2 p-2">
                      {foodEmojis.map((emoji) => (
                        <Button
                          key={emoji}
                          type="button"
                          variant={field.value === emoji ? "default" : "outline"}
                          className="h-10 w-10 p-0 text-lg"
                          onClick={() => field.onChange(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Category</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
