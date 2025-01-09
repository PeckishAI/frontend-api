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
import { Download, Plus, Search, Filter, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InsertItemDialog } from "@/components/inventory/InsertItemDialog";
import { useQuery } from "@tanstack/react-query";
import type { InventoryItem } from "@/lib/types";
import EditIngredientForm from "@/components/inventory/EditIngredientForm";
import NewIngredientDialog from "@/components/inventory/NewIngredientDialog";
import {
  FilterPopover,
  type FilterType,
} from "@/components/inventory/FilterPopover";
import { inventoryService } from "@/services/inventoryService";

export default function Inventory() {
  const [activeSection, setActiveSection] = useState("ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([]);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<
    InventoryItem | undefined
  >();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  const handleSort = (column: string) => {
    setSortColumn(column);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const sections = [
    { id: "ingredients", label: "Ingredients" },
    { id: "transfers", label: "Transfers" },
    { id: "waste", label: "Waste" },
  ];

  const { currentRestaurant } = useRestaurantContext();

  const {
    data: inventory = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["inventory", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return inventoryService.getRestaurantIngredients(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const tags = !inventory
    ? []
    : Array.from(
        new Set(inventory.flatMap((item) => item.tags.map((t) => t.tag_name))),
      );
  const suppliers = !inventory
    ? []
    : Array.from(
        new Set(
          inventory.flatMap((item) =>
            item.ingredient_suppliers.map((s) => s.supplier.supplier_name),
          ),
        ),
      );

  useEffect(() => {
    if (currentRestaurant?.restaurant_uuid) {
      refetch();
    }
  }, [currentRestaurant?.restaurant_uuid, refetch]);

  const filteredInventory = !inventory
    ? []
    : [...inventory]
        .sort((a, b) => {
          if (!sortColumn) return 0;

          let aValue, bValue;

          switch (sortColumn) {
            case "name":
              aValue = a.ingredient_name.toLowerCase();
              bValue = b.ingredient_name.toLowerCase();
              break;
            case "tags":
              aValue = a.tags.length;
              bValue = b.tags.length;
              break;
            case "par_level":
              aValue = a.par_level || 0;
              bValue = b.par_level || 0;
              break;
            case "quantity":
              aValue = a.quantity || 0;
              bValue = b.quantity || 0;
              break;
            case "unit":
              aValue = a.base_unit?.unit_name?.toLowerCase() || "";
              bValue = b.base_unit?.unit_name?.toLowerCase() || "";
              break;
            case "suppliers":
              aValue = a.ingredient_suppliers?.length || 0;
              bValue = b.ingredient_suppliers?.length || 0;
              break;
            default:
              return 0;
          }

          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
          return 0;
        })
        .filter((item) => {
          const matchesSearch = item.ingredient_name
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
            tagFilters.some((tag) => item.tags.some((t) => t.tag_name === tag));
          const matchesSuppliers =
            supplierFilters.length === 0 ||
            item.ingredient_suppliers.some((s) =>
              supplierFilters.includes(s.supplier?.supplier_name),
            );

          return matchesSearch && matchesTags && matchesSuppliers;
        });

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
      item.ingredient_name,
      item.tags.map(t => t.tag_name).join(", "),
      item.par_level,
      item.quantity,
      item.base_unit.unit_name,
      item.ingredient_suppliers
        .map(
          (s) => `${s.supplier.supplier_name} ($${s.unit_cost}/${s.pack_size})`,
        )
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
    <div className="ml-64 w-[calc(100%-16rem)]">
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
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                  >
                    <Filter className="h-4 w-4" />
                    {selectedFilters.length > 0 && (
                      <span className="absolute -top-2 -right-2 rounded-full bg-primary text-primary-foreground w-4 h-4 text-[10px] flex items-center justify-center">
                        {selectedFilters.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[200px] p-0">
                  <FilterPopover
                    tags={tags.map(tag => ({ tag_name: tag }))}
                    suppliers={suppliers}
                    selectedFilters={selectedFilters}
                    onFilterChange={setSelectedFilters}
                  />
                </PopoverContent>
              </Popover>
            </div>
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
                  <TableHead
                    sortable
                    sortKey="name"
                    sortDirection={
                      sortColumn === "name" ? sortDirection : undefined
                    }
                    onSort={() => handleSort("name")}
                  >
                    Name
                  </TableHead>
                  <TableHead
                    sortable
                    sortKey="tags"
                    sortDirection={
                      sortColumn === "tags" ? sortDirection : undefined
                    }
                    onSort={() => handleSort("tags")}
                  >
                    Tags
                  </TableHead>
                  <TableHead
                    sortable
                    sortKey="par_level"
                    sortDirection={
                      sortColumn === "par_level" ? sortDirection : undefined
                    }
                    onSort={() => handleSort("par_level")}
                  >
                    Par Level
                  </TableHead>
                  <TableHead
                    sortable
                    sortKey="quantity"
                    sortDirection={
                      sortColumn === "quantity" ? sortDirection : undefined
                    }
                    onSort={() => handleSort("quantity")}
                  >
                    Quantity
                  </TableHead>
                  <TableHead
                    sortable
                    sortKey="unit"
                    sortDirection={
                      sortColumn === "unit" ? sortDirection : undefined
                    }
                    onSort={() => handleSort("unit")}
                  >
                    Unit
                  </TableHead>
                  <TableHead
                    sortable
                    sortKey="suppliers"
                    sortDirection={
                      sortColumn === "suppliers" ? sortDirection : undefined
                    }
                    onSort={() => handleSort("suppliers")}
                  >
                    Suppliers
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow
                    key={item.ingredient_uuid}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedIngredient(item)}
                  >
                    <TableCell className="font-medium">
                      {item.ingredient_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.map((tag) => (
                          <Badge key={tag.tag_uuid} variant="secondary">
                            {tag.tag_name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{item.par_level}</TableCell>
                    <TableCell>
                      <span
                        className={
                          item.quantity < item.par_level
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{item.base_unit.unit_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.ingredient_suppliers.length > 0 &&
                          `${item.ingredient_suppliers.length} supplier${item.ingredient_suppliers.length > 1 ? "s" : ""}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Delete ingredient:", item.ingredient_uuid);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            description: `${data.ingredient_name} has been added to the inventory.`,
          });
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
            description: `${data.ingredient_name} has been updated in the inventory.`,
          });
        }}
      />
    </div>
  );
}
