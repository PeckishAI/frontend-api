import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  UtensilsCrossed,
  Sandwich,
  ScrollText,
  Layers,
  TagIcon,
  DollarSign,
  Percent,
} from "lucide-react";
import SubSectionNav from "@/components/layout/SubSectionNav";
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
import RecipeSheet, { defaultCategories } from "@/components/menu/RecipeSheet";
import { Badge } from "@/components/ui/badge";
import { menuService } from "@/services/menuService";
import { type Product } from "@/types/menu";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";

export default function Menu() {
  const [activeSection, setActiveSection] = useState("products");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editingRecipe, setEditingRecipe] = useState<Product | null>(null);
  const { currentRestaurant } = useRestaurantContext();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return menuService.getRestaurantProducts(
        currentRestaurant.restaurant_uuid,
      );
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
  });

  const sections = [
    { id: "products", label: "Products" },
    { id: "modifiers", label: "Modifiers" },
    { id: "preparations", label: "Preparations" },
  ];

  function ProductCard({ product }: { product: Product }) {
    return (
      <Card
        className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => setEditingRecipe(product)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sandwich className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{product.product_name}</CardTitle>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              {/* <TagIcon className="h-3 w-3" /> */}
              {/* TODO: Add category to Product type */}
              {product.category?.emoji}
              {product.category?.category_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Layers className="h-4 w-4" />
              <span>
                {product.product_ingredients?.length || 0} ingredients
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-gray-500">Price</div>
                </div>
                <div className="font-medium">
                  ${product.portion_price?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ScrollText className="h-4 w-4 text-gray-600" />
                  <div className="text-sm text-gray-500">Cost</div>
                </div>
                <div className="font-medium">
                  ${product.portion_cost?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="h-4 w-4 text-primary" />
                  <div className="text-sm text-gray-500">Margin</div>
                </div>
                <div className="font-semibold text-base">
                  {product.portion_price && product.portion_cost ? (
                    <>
                      <span className="text-2xl font-bold text-blue-600">
                        {(
                          (1 - product.portion_cost / product.portion_price) *
                          100
                        ).toFixed(1)}
                      </span>
                      <span className="text-sm ml-0.5 text-blue-600">%</span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="ml-64 w-[calc(100%-16rem)]">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="px-8 mt-6 mb-6 flex items-center justify-end gap-4">
          {activeSection === "products" && (
            <>
              <ViewToggle current={viewMode} onChange={setViewMode} />
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Product
              </Button>
            </>
          )}
          {(activeSection === "modifiers" ||
            activeSection === "preparations") && (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New {activeSection.slice(0, -1)}
            </Button>
          )}
        </div>

        {activeSection === "products" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {viewMode === "cards" ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.product_uuid} product={product} />
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
                    {products.map((product) => (
                      <TableRow
                        key={product.product_uuid}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setEditingRecipe(product)}
                      >
                        <TableCell>{product.product_name}</TableCell>
                        <TableCell>
                          {product.product_ingredients?.length || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          ${product.portion_price?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-right">
                          ${product.portion_cost?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.portion_price && product.portion_cost
                            ? `${((1 - product.portion_cost / product.portion_price) * 100).toFixed(1)}%`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {activeSection === "modifiers" && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            <p className="text-gray-600">Modifiers section coming soon...</p>
          </div>
        )}

        {activeSection === "preparations" && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            <p className="text-gray-600">Preparations section coming soon...</p>
          </div>
        )}
      </div>

      <RecipeSheet
        open={!!editingRecipe}
        onOpenChange={(open) => {
          if (!open) setEditingRecipe(null);
        }}
        product={editingRecipe ? editingRecipe : undefined}
        onSubmit={(data) => {
          console.log("Updated recipe:", data);
          setEditingRecipe(null);
        }}
      />
    </div>
  );
}
