import { useState } from "react";
import { FileText, Images, User2, Hash, Film } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Document = {
  type: 'image' | 'video';
  url: string;
};

type Stocktake = {
  id: string;
  date: Date;
  user: {
    name: string;
    avatar?: string;
  };
  documents: Document[];
};

const mockStocktakes: Stocktake[] = [
  {
    id: "ST-001",
    date: new Date(2024, 0, 15),
    user: {
      name: "John Doe",
    },
    documents: [
      { type: 'image', url: 'stocktake1-1.jpg' },
      { type: 'video', url: 'stocktake1-2.mp4' },
      { type: 'image', url: 'stocktake1-3.jpg' },
    ],
  },
  {
    id: "ST-002",
    date: new Date(2024, 0, 14),
    user: {
      name: "Jane Smith",
      avatar: "jane-avatar.jpg",
    },
    documents: [
      { type: 'video', url: 'stocktake2-1.mp4' },
      { type: 'image', url: 'stocktake2-2.jpg' },
    ],
  },
  {
    id: "ST-003",
    date: new Date(2024, 0, 13),
    user: {
      name: "Mike Johnson",
    },
    documents: [
      { type: 'image', url: 'stocktake3-1.jpg' },
      { type: 'image', url: 'stocktake3-2.jpg' },
      { type: 'video', url: 'stocktake3-3.mp4' },
      { type: 'image', url: 'stocktake3-4.jpg' },
    ],
  },
];

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  return (
    <div className="ml-64 w-full">
      <div className="pt-8">
        <div className="px-8 mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Stocktakes</h1>
        </div>

        <div className="px-8 mb-6 flex items-center justify-end gap-4">
          <ViewToggle current={viewMode} onChange={setViewMode} />
        </div>

        <div className="px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {viewMode === 'cards' ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockStocktakes.map((stocktake) => (
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
                    {mockStocktakes.map((stocktake) => (
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
