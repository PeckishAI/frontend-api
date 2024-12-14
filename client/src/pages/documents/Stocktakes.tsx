import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Stocktakes() {
  return (
    <div className="p-8 ml-64 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Stocktakes</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="h-5 w-5" />
            <p>Stocktakes section coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
