import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Filter, Check, Hash, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterType = {
  type: 'tag' | 'supplier';
  value: string;
};

interface FilterPopoverProps {
  tags: string[];
  suppliers: string[];
  selectedFilters: FilterType[];
  onFilterChange: (filters: FilterType[]) => void;
}

export function FilterPopover({ tags, suppliers, selectedFilters, onFilterChange }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    setActiveGroup(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={cn(
            selectedFilters.length > 0 && "border-solid"
          )}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Filter by</div>
              <div className="grid grid-cols-2 gap-2">
                <CommandItem
                  onSelect={() => setActiveGroup('tags')}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-muted-foreground">
                      <Hash className="h-4 w-4" />
                    </div>
                    <span>Tags</span>
                  </div>
                  {selectedFilters.filter(f => f.type === 'tag').length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {selectedFilters.filter(f => f.type === 'tag').length}
                    </Badge>
                  )}
                </CommandItem>
                <CommandItem
                  onSelect={() => setActiveGroup('suppliers')}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span>Suppliers</span>
                  </div>
                  {selectedFilters.filter(f => f.type === 'supplier').length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {selectedFilters.filter(f => f.type === 'supplier').length}
                    </Badge>
                  )}
                </CommandItem>
              </div>
            </CommandGroup>

            {activeGroup === 'tags' && (
              <CommandGroup className="pt-0">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Select tags</div>
                {tags.map((tag) => (
                  <CommandItem
                    key={`tag-${tag}`}
                    onSelect={() => toggleFilter({ type: 'tag', value: tag })}
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedFilters.some(f => f.type === 'tag' && f.value === tag)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {activeGroup === 'suppliers' && (
              <CommandGroup className="pt-0">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Select suppliers</div>
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={`supplier-${supplier}`}
                    onSelect={() => toggleFilter({ type: 'supplier', value: supplier })}
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
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        {selectedFilters.length > 0 && (
          <div className="border-t p-2">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
