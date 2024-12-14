import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
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
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "h-9 border-dashed",
            selectedFilters.length > 0 && "border-solid"
          )}
        >
          <Filter className="mr-2 h-4 w-4" />
          {selectedFilters.length === 0 ? (
            "Filter"
          ) : (
            <>
              {selectedFilters.length} filter{selectedFilters.length === 1 ? '' : 's'}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Filter by Tag">
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
                    <X className="h-4 w-4" />
                  </div>
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Filter by Supplier">
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
                    <X className="h-4 w-4" />
                  </div>
                  {supplier}
                </CommandItem>
              ))}
            </CommandGroup>
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
