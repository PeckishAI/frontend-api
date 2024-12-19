
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, FileBox, ClipboardCheck, Images, User2, Hash, Film } from "lucide-react";
import ViewToggle from "@/components/orders/ViewToggle";
import SubSectionNav from "@/components/layout/SubSectionNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { documentService } from "@/services/documentService";

export type Document = {
  type: 'image' | 'video';
  url: string;
};

export type Stocktake = {
  id: string;
  date: Date;
  user: {
    name: string;
    avatar?: string;
  };
  documents: Document[];
};

function StocktakeCard({ stocktake }: { stocktake: Stocktake }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">{stocktake.id}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{stocktake.user.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {stocktake.date.toLocaleDateString('en-US', { 
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Images className="h-8 w-8" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-gray-600" />
              <span className="font-medium">{stocktake.documents.filter(d => d.type === 'image').length}</span>
              <span className="text-sm text-gray-500">images</span>
            </div>
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-gray-600" />
              <span className="font-medium">{stocktake.documents.filter(d => d.type === 'video').length}</span>
              <span className="text-sm text-gray-500">videos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Stocktakes() {
  const [activeSection, setActiveSection] = useState('stocktakes');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { currentRestaurant } = useRestaurantContext();
  
  const sections = [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'delivery-notes', label: 'Delivery Notes', icon: FileBox },
    { id: 'stocktakes', label: 'Stocktakes', icon: ClipboardCheck },
  ];
  
  const { data: stocktakes = [], isLoading } = useQuery({
    queryKey: ["stocktakes", currentRestaurant?.restaurant_uuid],
    queryFn: () => {
      if (!currentRestaurant?.restaurant_uuid) {
        throw new Error("No restaurant selected");
      }
      return documentService.getRestaurantStocktakes(currentRestaurant.restaurant_uuid);
    },
    enabled: !!currentRestaurant?.restaurant_uuid,
    select: (data) => data.map((stocktake: any) => ({
      id: stocktake.stocktake_uuid,
      date: new Date(stocktake.to_char),
      user: {
        name: "System User", // Since user info isn't in the response
      },
      documents: stocktake.documents.map((doc: any) => ({
        type: doc.document_type,
        url: doc.file_path
      }))
    }))
  });

  const stocktakesList = stocktakes as Stocktake[];

  return (
    <div className="ml-64 w-full">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="px-8 mb-6 flex items-center justify-end gap-4">
          <ViewToggle current={viewMode} onChange={setViewMode} />
        </div>

        <div className="px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {viewMode === 'cards' ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-3 text-center py-8">Loading stocktakes...</div>
                ) : stocktakesList.map((stocktake) => (
                  <StocktakeCard key={stocktake.id} stocktake={stocktake} />
                ))}
              </div>
            ) : (
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead>Videos</TableHead>
                      <TableHead>Total Documents</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Loading stocktakes...</TableCell>
                      </TableRow>
                    ) : stocktakesList.map((stocktake) => (
                      <TableRow key={stocktake.id}>
                        <TableCell>{stocktake.id}</TableCell>
                        <TableCell>
                          {stocktake.date.toLocaleDateString('en-US', { 
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User2 className="h-4 w-4 text-gray-500" />
                            <span>{stocktake.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {stocktake.documents.filter(d => d.type === 'image').length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {stocktake.documents.filter(d => d.type === 'video').length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>
                            {stocktake.documents.length}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
