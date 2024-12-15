import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { GridDataInput } from "./GridDataInput";
import NewIngredientDialog from "./NewIngredientDialog";
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
      <DialogContent className="sm:max-w-[600px]">
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Insert</TabsTrigger>
            <TabsTrigger value="file">Insert from File</TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="mt-4">
            <h3 className="mb-4 text-lg font-medium">Add New Ingredient</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter data manually or paste from a spreadsheet (one row per ingredient).
              </p>
              <GridDataInput
                onChange={(data) => {
                  console.log('Grid data:', data);
                }}
              />
              <div className="flex justify-end">
                <Button type="submit" onClick={() => {
                  // Handle submission
                  setOpen(false);
                }}>
                  Add Items
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="file" className="mt-4">
            <h3 className="mb-4 text-lg font-medium">Import from File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file with your inventory items. The file should include columns for name, quantity, unit, and tags.
            </p>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Plus className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
                <input type="file" className="hidden" accept=".csv" />
              </label>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
