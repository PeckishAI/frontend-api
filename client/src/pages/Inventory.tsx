import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SubSectionNav from "@/components/layout/SubSectionNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Search } from "lucide-react";
import { InsertItemDialog } from "@/components/inventory/InsertItemDialog";
import { useQuery } from "@tanstack/react-query";
import type { InventoryItem } from "@/lib/types";
import EditIngredientForm from "@/components/inventory/EditIngredientForm";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";
import {
  FilterPopover,
  type FilterType,
} from "@/components/inventory/FilterPopover";
import { mockInventory } from "@/mockData/inventory";
import { inventoryService } from "@/services/inventoryService";

export default function Inventory() {
  const [activeSection, setActiveSection] = useState("ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([]);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<
    InventoryItem | undefined
  >();
  const { toast } = useToast();

  const sections = [
    { id: "ingredients", label: "Ingredients" },
    { id: "transfers", label: "Transfers" },
    { id: "waste", label: "Waste" },
  ];

  const { currentRestaurant } = useRestaurantContext();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading, refetch } = useQuery({
    queryKey: ["inventory", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return inventoryService.getRestaurantInventory(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
    select: (data) => {
      if (!data?.data) return [];
      console.log("Raw data in select:", data);
      const inventoryItems = Object.values(data.data);
      return inventoryItems.map((item: any) => ({
        id: item.ingredient_uuid,
        name: item.ingredient_name,
        tags: Array.isArray(item.tags) ? item.tags.map((tag: any) => tag.tag_name) : [],
        parLevel: item.par_level || 0,
        quantity: item.quantity || 0,
        unit: item.unit_name || '',
        suppliers: Array.isArray(item.suppliers) ? item.suppliers.map((s: any) => ({
          supplierName: s.supplier_name || '',
          unitCost: s.unit_cost || 0,
          packSize: s.pack_size || ''
        })) : []
      }));
    },
  });
  console.log("inventory", inventory);

  const tags = useMemo(() => {
    if (!inventory) return [];
    return Array.from(new Set(inventory.flatMap((item) => item.tags)));
  }, [inventory]);

  const suppliers = useMemo(() => {
    if (!inventory) return [];
    return Array.from(
      new Set(
        inventory.flatMap((item) => item.suppliers.map((s) => s.supplierName)),
      ),
    );
  }, [inventory]);

  useEffect(() => {
    if (currentRestaurant?.restaurant_uuid) {
      refetch();
    }
  }, [currentRestaurant?.restaurant_uuid, refetch]);

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const tagFilters = selectedFilters
        .filter((f) => f.type === "tag")
        .map((f) => f.value);
      const supplierFilters = selectedFilters
        .filter((f) => f.type === "supplier")
        .map((f) => f.value);

      const matchesTags =
        tagFilters.length === 0 ||
        tagFilters.some((tag) => item.tags.includes(tag));
      const matchesSuppliers =
        supplierFilters.length === 0 ||
        item.suppliers.some((s) => supplierFilters.includes(s.supplierName));

      return matchesSearch && matchesTags && matchesSuppliers;
    });
  }, [searchQuery, selectedFilters]);

  const exportToCsv = () => {
    const headers = [
      "Name",
      "Tags",
      "Par Level",
      "Quantity",
      "Unit",
      "Suppliers",
    ];
    const csvData = filteredInventory.map((item) => [
      item.name,
      item.tags.join(", "),
      item.parLevel,
      item.quantity,
      item.unit,
      item.suppliers
        .map((s) => `${s.supplierName} ($${s.unitCost}/${s.packSize})`)
        .join("; "),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "inventory.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="ml-64 w-full">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {activeSection === "ingredients" && (
          <div className="px-8 mt-6 mb-6 flex items-center gap-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex-1" />
            <Button onClick={() => setIsNewItemOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Item
            </Button>
            <Button onClick={exportToCsv} variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <InsertItemDialog />
            <FilterPopover
              tags={tags}
              suppliers={suppliers}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
            />
          </div>
        )}
      </div>

      {activeSection === "ingredients" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">Loading inventory...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Par Level</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Suppliers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedIngredient(item)}
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{item.parLevel}</TableCell>
                    <TableCell>
                      <span
                        className={
                          item.quantity < item.parLevel
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.suppliers.length} supplier
                        {item.suppliers.length !== 1 ? "s" : ""}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {activeSection === "transfers" && (
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <h2 className="text-lg font-medium mb-4">Transfer Management</h2>
          <p className="text-gray-600">
            Coming soon: Track and manage inventory transfers between locations
            or departments.
          </p>
        </div>
      )}

      {activeSection === "waste" && (
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <h2 className="text-lg font-medium mb-4">Waste Management</h2>
          <p className="text-gray-600">
            Coming soon: Monitor and track inventory waste, reasons, and
            optimization opportunities.
          </p>
        </div>
      )}

      <NewIngredientDialog
        open={isNewItemOpen}
        onOpenChange={setIsNewItemOpen}
        onSubmit={(data) => {
          toast({
            title: "Item Added",
            description: `${data.name} has been added to the inventory.`,
          });
          // In a real app, we would add the item to the database here
          console.log("New item:", data);
        }}
      />

      <EditIngredientForm
        open={!!selectedIngredient}
        onOpenChange={(open) => {
          if (!open) setSelectedIngredient(undefined);
        }}
        ingredient={selectedIngredient}
        onSubmit={(data) => {
          toast({
            title: "Item Updated",
            description: `${data.name} has been updated in the inventory.`,
          });
          // In a real app, we would update the item in the database here
          console.log("Updated item:", data);
        }}
      />
    </div>
  );
}
