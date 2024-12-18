import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type SelectOption = {
  value: string;
  label: string;
  category?: string;
};

interface CreatableSelectProps {
  value: string[] | null;
  onChange: (value: string[]) => void;
  options: SelectOption[];
  onCreateOption?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  createOptionLabel?: string;
  emptyMessage?: string;
  className?: string;
  multiple?: boolean;
}

export function CreatableSelect({
  value,
  onChange,
  options,
  onCreateOption,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  createOptionLabel = "Create",
  emptyMessage = "No results found.",
  className,
  multiple = false,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Group options by category
  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: SelectOption[] } = {};
    options.forEach((option) => {
      const category = option.category || "Default";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
    });
    return groups;
  }, [options]);

  const selectedLabels = React.useMemo(() => {
    const valueArray = Array.isArray(value) ? value : value ? [value] : [];
    return valueArray
      .map((v) => options.find((opt) => opt.value === v)?.label || v)
      .join(", ");
  }, [value, options]);

  const filteredOptions = React.useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered: { [key: string]: SelectOption[] } = {};

    Object.entries(groupedOptions).forEach(([category, opts]) => {
      const matchingOpts = opts.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchLower) ||
          opt.value.toLowerCase().includes(searchLower)
      );
      if (matchingOpts.length > 0) {
        filtered[category] = matchingOpts;
      }
    });

    return filtered;
  }, [groupedOptions, search]);

  const handleSelect = (selectedValue: string) => {
    if (multiple) {
      onChange(
        value.includes(selectedValue)
          ? value.filter((v) => v !== selectedValue)
          : [...value, selectedValue]
      );
    } else {
      onChange([selectedValue]);
      setOpen(false);
    }
  };

  const handleCreate = () => {
    if (search && onCreateOption) {
      onCreateOption(search);
      setSearch("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {(value && value.length > 0) ? selectedLabels : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0 max-h-[300px]">
        <Command className="max-h-[300px]">
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[200px] overflow-y-auto overflow-x-hidden touch-auto">
            <CommandEmpty className="p-2">
              {search.trim() !== "" && onCreateOption ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCreate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createOptionLabel} "{search}"
                </Button>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            {Object.entries(filteredOptions).map(([category, opts]) => (
              <React.Fragment key={category}>
                <CommandGroup heading={category === "Default" ? undefined : category}>
                  {opts.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          Array.isArray(value) && value.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}