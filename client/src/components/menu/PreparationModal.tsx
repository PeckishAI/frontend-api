
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Plus, Trash2 } from "lucide-react";
import { menuService } from "@/services/menuService";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";

// ... rest of your code remains the same until render function ...

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
  const [showNewIngredientDialog, setShowNewIngredientDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const { currentRestaurant } = useRestaurantContext();
  const queryClient = useQueryClient();

  // ... rest of the component remains the same but remove the PreparationModal self-reference ...

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* ... existing dialog content ... */}
      </Dialog>

      <NewIngredientDialog 
        open={showNewIngredientDialog}
        onOpenChange={setShowNewIngredientDialog}
        defaultName={newItemName}
        onSubmit={async (data) => {
          if (!currentRestaurant?.restaurant_uuid) return;
          const newIngredient = await inventoryService.createIngredient(
            currentRestaurant.restaurant_uuid,
            data
          );
          queryClient.invalidateQueries(["ingredients"]);
          setShowNewIngredientDialog(false);
        }}
      />
    </>
  );
}
