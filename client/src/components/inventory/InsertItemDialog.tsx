import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { GridDataInput } from "./GridDataInput";
import { useState } from "react";

export function InsertItemDialog() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9">
          <Plus className="mr-2 h-4 w-4" />
          Insert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] max-h-[80vh] p-6">
        <Tabs defaultValue="manual" className="h-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual">Manual Insert</TabsTrigger>
            <TabsTrigger value="file">Insert from File</TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="mt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Enter data manually or paste from a spreadsheet (one row per ingredient).
            </p>
            <div className="h-[calc(60vh-100px)] mb-4">
              <GridDataInput
                onChange={(data) => {
                  console.log('Grid data:', data);
                }}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>
                Add Items
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="file" className="mt-0">
            <h3 className="text-lg font-medium mb-4">Import from File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file with your inventory items. The file should include columns for name, quantity, unit, and tags.
            </p>
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Plus className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
              <input type="file" className="hidden" accept=".csv" />
            </label>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}