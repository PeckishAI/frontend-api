
import * as React from "react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreatableSelect } from "@/components/ui/creatable-select";
import type { Invoice } from "@/pages/Documents";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { supplierService } from "@/services/supplierService";
import { inventoryService } from "@/services/inventoryService";
import { unitService } from "@/services/unitService";

// Schema and types remain unchanged...

export function EditInvoiceSlider({
  invoice,
  open,
  onOpenChange,
}: EditInvoiceSliderProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const { currentRestaurant } = useRestaurantContext();

  const form = useForm<EditInvoiceFormValues>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: {
      invoice_number: "",
      date: "",
      amount: 0,
      ingredients: [],
      documents: [],
    },
  });

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("Missing restaurant or supplier UUID");
      }
      return supplierService.getRestaurantSuppliers(
        currentRestaurant?.restaurant_uuid,
      );
    },
  });

  const { data: supplierIngredientUnits } = useQuery({
    queryKey: [
      "supplier-ingredient-units",
      currentRestaurant?.restaurant_uuid,
      form.watch("supplier")?.supplier_uuid,
    ],
    queryFn: () => {
      if (
        !currentRestaurant?.restaurant_uuid ||
        !form.watch("supplier")?.supplier_uuid
      ) {
        throw new Error("Missing restaurant or supplier UUID");
      }
      return unitService.getSupplierIngredientUnits(
        currentRestaurant.restaurant_uuid,
        form.watch("supplier").supplier_uuid,
      );
    },
    enabled:
      !!currentRestaurant?.restaurant_uuid &&
      !!form.watch("supplier")?.supplier_uuid,
  });

  // Rest of your component code remains unchanged...
