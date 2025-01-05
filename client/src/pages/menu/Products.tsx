import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
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
import RecipeSheet from "@/components/menu/ProductSheet";
import { Badge } from "@/components/ui/badge";
import { menuService } from "@/services/menuService";
import { type Product } from "@/types/menu";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";

export default function Products() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editingRecipe, setEditingRecipe] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // Added search state
  const { currentRestaurant, currencyInfo } = useRestaurantContext();

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
                {product.product_ingredients?.length +
                  product.product_preparations?.length || 0}{" "}
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
                  {product.portion_price?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ScrollText className="h-4 w-4 text-gray-600" />
                  <div className="text-sm text-gray-500">Cost</div>
                </div>
                <div className="font-medium">
                  {currencyInfo?.currencySymbol}
                  {product.portion_cost?.toFixed(2) || "0.00"}
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
    <div className="px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle current={viewMode} onChange={setViewMode} />
          <Button onClick={() => setEditingRecipe({})}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </div>
      </div> {/* Added search input */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {viewMode === "cards" ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.filter(product =>
              product.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((product) => (
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
                {products.filter(product =>
                  product.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((product) => (
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
                      {currencyInfo?.currencySymbol}
                      {product.portion_price?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      {currencyInfo?.currencySymbol}
                      {product.portion_cost?.toFixed(2) || "0.00"}
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