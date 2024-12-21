
import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

export type SelectOption = {
  value: string;
  label: string;
  category?: string;
};

interface CreatableSelectProps {
  value?: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  onCreateOption?: (value: string) => Promise<void>;
  placeholder?: string;
  searchPlaceholder?: string;
  createOptionLabel?: string;
  multiple?: boolean;
  className?: string;
}

export function CreatableSelect({
  value = [],
  onChange,
  options,
  onCreateOption,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  createOptionLabel = "Create",
  multiple = false,
  className,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const filteredOptions = React.useMemo(() => {
    const searchTerm = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm) ||
        option.value.toLowerCase().includes(searchTerm)
    );
  }, [options, search]);

  const selectedLabels = React.useMemo(() => {
    return value
      .map((v) => options.find((opt) => opt.value === v)?.label || v)
      .join(", ");
  }, [value, options]);

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
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
      setSearch("");
    },
    [value, multiple, onChange]
  );

  const handleCreate = React.useCallback(async () => {
    if (search && onCreateOption && !isCreating) {
      setIsCreating(true);
      try {
        await onCreateOption(search);
        setSearch("");
      } catch (error) {
        console.error("Failed to create option:", error);
      } finally {
        setIsCreating(false);
      }
    }
  }, [search, onCreateOption, isCreating]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={className}
        >
          {value.length > 0 ? selectedLabels : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command className="w-full">
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <div className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>
              {search && onCreateOption && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createOptionLabel} "{search}"
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
