import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Invoices() {
  return (
    <div className="w-full">
      <div className="pt-4 px-8 mb-4">
        <h1 className="text-3xl font-semibold text-gray-900">Invoices</h1>
      </div>
      <div className="px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>INV-2024-002</TableCell>
                <TableCell>January 14, 2024</TableCell>
                <TableCell>Meat Suppliers Inc.</TableCell>
                <TableCell className="text-right">$843.50</TableCell>
                <TableCell className="text-right">8</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>INV-2024-003</TableCell>
                <TableCell>January 13, 2024</TableCell>
                <TableCell>Grocery Wholesale Ltd.</TableCell>
                <TableCell className="text-right">$567.25</TableCell>
                <TableCell className="text-right">12</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
