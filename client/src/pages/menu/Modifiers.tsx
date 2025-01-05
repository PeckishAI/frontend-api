import { useState } from "react";
import ModifierSheet from "@/components/menu/ModifierSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Sandwich,
  Search,
  ScrollText,
  Layers,
  DollarSign,
  Percent,
} from "lucide-react";
import ViewToggle from "@/components/orders/ViewToggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { menuService } from "@/services/menuService";
import { type Modifier } from "@/types/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";

export default function Modifiers() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Added search state
  const { currentRestaurant, currencyInfo } = useRestaurantContext();
  const queryClient = useQueryClient();

  const { data: modifiers = [], isLoading } = useQuery({
    queryKey: ["modifiers", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return menuService.getRestaurantModifiers(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  function ModifierCard({ modifier }: { modifier: Modifier }) {
    return (
      <Card
        className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => setEditingModifier(modifier)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sandwich className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {modifier.modifier_name}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              {modifier.category?.emoji}
              {modifier.category?.category_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Layers className="h-4 w-4" />
              <span>
                {modifier.modifier_ingredients?.length ||
                  0 + modifier.modifier_preparations?.length ||
                  0}{" "}
                ingredients
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-gray-500">Price</div>
                </div>
                <div className="font-medium">
                  {currencyInfo?.currencySymbol}
                  {modifier.portion_price?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ScrollText className="h-4 w-4 text-gray-600" />
                  <div className="text-sm text-gray-500">Cost</div>
                </div>
                <div className="font-medium">
                  {currencyInfo?.currencySymbol}
                  {modifier.portion_cost?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="h-4 w-4 text-primary" />
                  <div className="text-sm text-gray-500">Margin</div>
                </div>
                <div className="font-medium">
                  {modifier.portion_price && modifier.portion_cost
                    ? `${((1 - modifier.portion_cost / modifier.portion_price) * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <div className="p-8">Loading modifiers...</div>;
  }

  return (
    <div className="px-8 pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search modifiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ViewToggle current={viewMode} onChange={setViewMode} />
          <Button onClick={() => setEditingModifier({})}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Modifier
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {viewMode === "cards" ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modifiers.filter((modifier) =>
              modifier.modifier_name?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((modifier) => (
              <ModifierCard key={modifier.modifier_uuid} modifier={modifier} />
            ))}
          </div>
        ) : (
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ingredients</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modifiers.filter((modifier) =>
                  modifier.modifier_name?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((modifier) => (
                  <TableRow
                    key={modifier.modifier_uuid}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setEditingModifier(modifier)}
                  >
                    <TableCell>{modifier.modifier_name}</TableCell>
                    <TableCell>
                      {modifier.modifier_ingredients?.length || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {currencyInfo?.currencySymbol}
                      {modifier.portion_price?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      {currencyInfo?.currencySymbol}
                      {modifier.portion_cost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      {modifier.portion_price && modifier.portion_cost
                        ? `${((1 - modifier.portion_cost / modifier.portion_price) * 100).toFixed(1)}%`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add ModifierSheet */}
      <ModifierSheet
        open={!!editingModifier}
        onOpenChange={(open) => {
          if (!open) setEditingModifier(null);
        }}
        modifier={editingModifier || undefined}
        onSubmit={async (data) => {
          if (!currentRestaurant?.restaurant_uuid) return;
          if (data.modifier_uuid) {
            await menuService.updateModifier(
              currentRestaurant.restaurant_uuid,
              data.modifier_uuid,
              data,
            );
          } else {
            await menuService.createModifier(
              currentRestaurant.restaurant_uuid,
              data,
            );
          }
          queryClient.invalidateQueries(["modifiers"]);
        }}
      />
    </div>
  );
}