import PreparationModal from "@/components/menu/PreparationModal";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  UtensilsCrossed,
  Sandwich,
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
import PreparationSheet from "@/components/menu/PreparationSheet";
import { Badge } from "@/components/ui/badge";
import { menuService } from "@/services/menuService";
import { type Preparation } from "@/types/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";

export default function Preparations() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editingPreparation, setEditingPreparation] =
    useState<Preparation | null>(null);
  const { currentRestaurant } = useRestaurantContext();
  const queryClient = useQueryClient();

  const { data: preparations = [], isLoading } = useQuery({
    queryKey: ["preparations", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return menuService.getRestaurantPreparations(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  function PreparationCard({ preparation }: { preparation: Preparation }) {
    return (
      <Card
        className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => setEditingPreparation(preparation)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {preparation.preparation_name}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              {preparation.category?.emoji}
              {preparation.category?.category_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Layers className="h-4 w-4" />
              <span>
                {preparation.preparation_ingredients?.length +
                  preparation.preparation_preparations?.length || 0}{" "}
                ingredients
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-gray-500">Cost</div>
                </div>
                <div className="font-medium">
                  ${preparation.portion_cost?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ScrollText className="h-4 w-4 text-gray-600" />
                  <div className="text-sm text-gray-500">Portions</div>
                </div>
                <div className="font-medium">
                  {preparation.portion_count || 1}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="h-4 w-4 text-primary" />
                  <div className="text-sm text-gray-500">Per Portion</div>
                </div>
                <div className="font-medium">
                  $
                  {(
                    (preparation.portion_cost || 0) /
                    (preparation.portion_count || 1)
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <div className="p-8">Loading preparations...</div>;
  }

  return (
    <div className="px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Preparations</h2>
        <div className="flex items-center gap-4">
          <ViewToggle current={viewMode} onChange={setViewMode} />
          <Button onClick={() => setEditingPreparation(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Preparation
          </Button>
          <PreparationModal
            open={editingPreparation === true}
            onOpenChange={(open) => {
              if (!open) setEditingPreparation(null);
            }}
            onSubmit={async (data) => {
              try {
                if (!currentRestaurant?.restaurant_uuid) {
                  throw new Error("No restaurant selected");
                }
                await menuService.createPreparation(currentRestaurant.restaurant_uuid, data);
                queryClient.invalidateQueries(["preparations"]);
                setEditingPreparation(null);
              } catch (error) {
                console.error("Failed to save preparation:", error);
              }
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {viewMode === "cards" ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preparations.map((preparation) => (
              <PreparationCard
                key={preparation.preparation_uuid}
                preparation={preparation}
              />
            ))}
          </div>
        ) : (
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ingredients</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Portions</TableHead>
                  <TableHead className="text-right">Cost/Portion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preparations.map((preparation) => (
                  <TableRow
                    key={preparation.preparation_uuid}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setEditingPreparation(preparation)}
                  >
                    <TableCell>{preparation.preparation_name}</TableCell>
                    <TableCell>
                      {preparation.preparation_ingredients?.length +
                        preparation.preparation_preparations?.length || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      ${preparation.portion_cost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      {preparation.portion_count || 1}
                    </TableCell>
                    <TableCell className="text-right">
                      $
                      {(
                        (preparation.portion_cost || 0) /
                        (preparation.portion_count || 1)
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <PreparationSheet
        open={!!editingPreparation && editingPreparation !== true}
        onOpenChange={(open) => {
          if (!open) setEditingPreparation(null);
        }}
        preparation={editingPreparation || undefined}
        onSubmit={async (data) => {
          try {
            if (!currentRestaurant?.restaurant_uuid) {
              throw new Error("No restaurant selected");
            }

            if (editingPreparation?.preparation_uuid) {
              await menuService.updatePreparation(
                currentRestaurant.restaurant_uuid,
                data,
              );
            } else {
              await menuService.createPreparation(
                currentRestaurant.restaurant_uuid,
                data,
              );
            }
            setEditingPreparation(null);
          } catch (error) {
            console.error("Failed to save preparation:", error);
          }
        }}
      />
    </div>
  );
}