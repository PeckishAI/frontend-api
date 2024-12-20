
import { useState } from "react";
import { Images } from "lucide-react";
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

export default function Invoices() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  return (
    <div className="ml-64 w-[calc(100%-16rem)]">
      <div className="pt-8 px-8">
        <div className="mb-6 flex items-center justify-end gap-4">
          <ViewToggle current={viewMode} onChange={setViewMode} />
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {viewMode === "cards" ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg font-semibold">INV-2024-001</CardTitle>
                    <Badge variant="secondary">Fresh Produce Co.</Badge>
                    <div className="text-sm text-muted-foreground">January 15, 2024</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <Images className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="font-medium">$1250.99</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Ingredients</div>
                        <div className="font-medium">15</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Images</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Ingredients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>INV-2024-001</TableCell>
                    <TableCell>January 15, 2024</TableCell>
                    <TableCell>Fresh Produce Co.</TableCell>
                    <TableCell className="text-right">$1250.99</TableCell>
                    <TableCell className="text-right">15</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
