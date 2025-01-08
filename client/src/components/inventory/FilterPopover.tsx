import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Hash, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export type FilterType = {
  type: 'tag' | 'supplier';
  value: string;
};

interface FilterPopoverProps {
  tags: {tag_name:string}[];
  suppliers: string[];
  selectedFilters: FilterType[];
  onFilterChange: (filters: FilterType[]) => void;
}

export function FilterPopover({ tags, suppliers, selectedFilters, onFilterChange }: FilterPopoverProps) {
  const [activeGroup, setActiveGroup] = useState<'tags' | 'suppliers' | null>(null);

  const toggleFilter = (filter: FilterType) => {
    const exists = selectedFilters.some(
      f => f.type === filter.type && f.value === filter.value
    );

    if (exists) {
      onFilterChange(selectedFilters.filter(
        f => !(f.type === filter.type && f.value === filter.value)
      ));
    } else {
      onFilterChange([...selectedFilters, filter]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
    setActiveGroup(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button 
          variant={activeGroup === 'tags' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveGroup(activeGroup === 'tags' ? null : 'tags')}
          className="flex items-center gap-2"
        >
          <Hash className="h-4 w-4" />
          Tags
          {selectedFilters.filter(f => f.type === 'tag').length > 0 && (
            <Badge variant="secondary">
              {selectedFilters.filter(f => f.type === 'tag').length}
            </Badge>
          )}
        </Button>
        <Button 
          variant={activeGroup === 'suppliers' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveGroup(activeGroup === 'suppliers' ? null : 'suppliers')}
          className="flex items-center gap-2"
        >
          <Building2 className="h-4 w-4" />
          Suppliers
          {selectedFilters.filter(f => f.type === 'supplier').length > 0 && (
            <Badge variant="secondary">
              {selectedFilters.filter(f => f.type === 'supplier').length}
            </Badge>
          )}
        </Button>
        {selectedFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {activeGroup && (
        <div className="border rounded-lg p-2 mt-1 bg-white shadow-sm">
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {activeGroup === 'tags' ? (
                tags.map((tag) => (
                  <Button
                    key={tag.tag_name}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => toggleFilter({ type: 'tag', value: tag.tag_name })}
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedFilters.some(f => f.type === 'tag' && f.value === tag.tag_name)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    {tag.tag_name}
                  </Button>
                ))
              ) : (
                suppliers.map((supplier) => (
                  <Button
                    key={supplier}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => toggleFilter({ type: 'supplier', value: supplier })}
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedFilters.some(f => f.type === 'supplier' && f.value === supplier)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    {supplier}
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}