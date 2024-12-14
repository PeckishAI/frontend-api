import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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

  const sections = [
    { id: 'products', label: 'Products' },
    { id: 'modifiers', label: 'Modifiers' },
    { id: 'preparations', label: 'Preparations' },
  ];

  function ProductCard({ product }: { product: Product }) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Ingredients</div>
            <div className="text-right font-medium">{product.ingredients.length}</div>
            <div className="text-gray-500">Price</div>
            <div className="text-right font-medium">${product.price.toFixed(2)}</div>
            <div className="text-gray-500">Cost</div>
            <div className="text-right font-medium">${product.cost.toFixed(2)}</div>
            <div className="text-gray-500">Margin</div>
            <div className="text-right font-medium">{product.margin.toFixed(1)}%</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-8 ml-64 w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Menu</h1>
          <div className="flex items-center gap-4">
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
        </div>

        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

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
                      <TableRow key={product.id}>
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
    </div>
  );
}
