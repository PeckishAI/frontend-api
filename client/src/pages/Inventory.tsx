import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Search } from "lucide-react";
import { mockInventory, getAllTags, getAllSuppliers } from '@/lib/data';
import type { InventoryItem } from '@/lib/types';

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');

  const tags = getAllTags();
  const suppliers = getAllSuppliers();

  const filteredInventory = useMemo(() => {
    return mockInventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || item.tags.includes(selectedTag);
      const matchesSupplier = !selectedSupplier || 
        item.suppliers.some(s => s.supplierName === selectedSupplier);
      
      return matchesSearch && matchesTag && matchesSupplier;
    });
  }, [searchQuery, selectedTag, selectedSupplier]);

  const exportToCsv = () => {
    const headers = ['Name', 'Tags', 'Par Level', 'Quantity', 'Unit', 'Suppliers'];
    const csvData = filteredInventory.map(item => [
      item.name,
      item.tags.join(', '),
      item.parLevel,
      item.quantity,
      item.unit,
      item.suppliers.map(s => `${s.supplierName} ($${s.unitCost}/${s.packSize})`).join('; ')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'inventory.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 ml-64">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Inventory</h1>
          <div className="flex gap-4">
            <Button onClick={exportToCsv} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Item
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tags</SelectItem>
              {tags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All suppliers</SelectItem>
              {suppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Par Level</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Suppliers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{item.parLevel}</TableCell>
                <TableCell>
                  <span className={item.quantity < item.parLevel ? 'text-red-600 font-medium' : ''}>
                    {item.quantity}
                  </span>
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {item.suppliers.map(supplier => (
                      <div key={supplier.supplierId} className="text-sm">
                        {supplier.supplierName} - ${supplier.unitCost}/{supplier.packSize}
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
