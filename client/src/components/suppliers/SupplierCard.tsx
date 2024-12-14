import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Star } from "lucide-react";
import { type Supplier } from "@/lib/types";

interface SupplierCardProps {
  supplier: Supplier;
  onClick: () => void;
}

export default function SupplierCard({ supplier, onClick }: SupplierCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="font-semibold text-xl">{supplier.name}</h2>
        <Badge variant="secondary">{supplier.category}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Building2 className="mr-2 h-4 w-4" />
            {supplier.category}
          </div>
          {supplier.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="mr-2 h-4 w-4" />
              {supplier.email}
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="mr-2 h-4 w-4" />
              {supplier.phone}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Star className="mr-2 h-4 w-4 text-yellow-400" />
            {supplier.rating.toFixed(1)} / 5.0
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
