import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, UtensilsCrossed, Sandwich, ScrollText, Layers, TagIcon, DollarSign, Percent } from "lucide-react";
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

type Product = {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  price: number;
  cost: number;
  margin: number;
};

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    category: "Pizza",
    ingredients: ["Tomato Sauce", "Mozzarella", "Basil"],
    price: 12.99,
    cost: 4.50,
    margin: 65.36,
  },
  {
    id: "2",
    name: "Caesar Salad",
    category: "Salads",
    ingredients: ["Romaine Lettuce", "Croutons", "Parmesan", "Caesar Dressing"],
    price: 8.99,
    cost: 2.80,
    margin: 68.85,
  },
  {
    id: "3",
    name: "Spaghetti Carbonara",
    category: "Pasta",
    ingredients: ["Spaghetti", "Eggs", "Pecorino Romano", "Guanciale", "Black Pepper"],
    price: 14.99,
    cost: 5.20,
    margin: 65.31,
  },
];

export default function Menu() {
  const [activeSection, setActiveSection] = useState('products');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [editingRecipe, setEditingRecipe] = useState<Product | null>(null);

  const sections = [
    { id: 'products', label: 'Products' },
    { id: 'modifiers', label: 'Modifiers' },
    { id: 'preparations', label: 'Preparations' },
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
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <TagIcon className="h-3 w-3" />
              {product.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Layers className="h-4 w-4" />
              <span>{product.ingredients.length} ingredients</span>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-gray-500">Price</div>
                </div>
                <div className="font-medium">${product.price.toFixed(2)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ScrollText className="h-4 w-4 text-gray-600" />
                  <div className="text-sm text-gray-500">Cost</div>
                </div>
                <div className="font-medium">${product.cost.toFixed(2)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="h-4 w-4 text-primary" />
                  <div className="text-sm text-gray-500">Margin</div>
                </div>
                <div className="font-semibold text-base">
                  <span className="text-2xl font-bold text-blue-600">{product.margin.toFixed(1)}</span>
                  <span className="text-sm ml-0.5 text-blue-600">%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="ml-64 w-full">
      <div className="px-8 pt-8 mb-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="flex items-center gap-4 mb-6">
          {activeSection === 'products' && (
            <>
              <ViewToggle current={viewMode} onChange={setViewMode} />
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Product
              </Button>
            </>
          )}
          {(activeSection === 'modifiers' || activeSection === 'preparations') && (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New {activeSection.slice(0, -1)}
            </Button>
          )}
        </div>

        {activeSection === 'products' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {viewMode === 'cards' ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Ingredients</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProducts.map((product) => (
                      <TableRow 
                        key={product.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setEditingRecipe(product)}
                      >
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.ingredients.length}</TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${product.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.margin.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'modifiers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            <p className="text-gray-600">Modifiers section coming soon...</p>
          </div>
        )}

        {activeSection === 'preparations' && (
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
        recipe={editingRecipe ? {
          id: editingRecipe.id,
          name: editingRecipe.name,
          category: {
            value: editingRecipe.category.toLowerCase(),
            label: editingRecipe.category,
            emoji: defaultCategories.find(c => 
              c.value === editingRecipe.category.toLowerCase())?.emoji || '🍽️'
          },
          portionCount: 1,
          ingredients: editingRecipe.ingredients.map(name => ({
            id: `${name}-${Math.random()}`,
            name,
            quantity: 1,
            unit: 'g'
          })),
          price: editingRecipe.price,
          cost: editingRecipe.cost
        } : undefined}
        onSubmit={(data) => {
          console.log('Updated recipe:', data);
          setEditingRecipe(null);
        }}
      />
    </div>
  );
}
