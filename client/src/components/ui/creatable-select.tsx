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
  value?: string[] | null;
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
  const commandRef = React.useRef<HTMLDivElement>(null);

  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: SelectOption[] } = {};
    if (options) {
      options.forEach((option) => {
        const category = option.category || "Default";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(option);
      });
    }
    return groups;
  }, [options]);

  const selectedLabels = React.useMemo(() => {
    const valueArray = Array.isArray(value) ? value : [];
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
          opt.value.toLowerCase().includes(searchLower),
      );
      if (matchingOpts.length > 0) {
        filtered[category] = matchingOpts;
      }
    });

    return filtered;
  }, [groupedOptions, search]);

  const handleSelect = React.useCallback((selectedValue: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    const currentValue = value || [];
    if (multiple) {
      onChange(
        currentValue.includes(selectedValue)
          ? currentValue.filter((v) => v !== selectedValue)
          : [...currentValue, selectedValue],
      );
    } else {
      onChange([selectedValue]);
      setOpen(false);
    }
  }, [multiple, onChange, value]);

  const handleCreate = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (search && onCreateOption) {
      onCreateOption(search);
      setSearch("");
    }
  }, [onCreateOption, search]);

  // Handle clicks outside of the component
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value && value.length > 0 ? selectedLabels : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        style={{ zIndex: 9999 }}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <Command ref={commandRef} className="w-full h-full overflow-hidden">
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {search.trim() !== "" && onCreateOption ? (
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-accent hover:text-accent-foreground active:bg-accent/90"
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
                <CommandGroup
                  heading={category === "Default" ? undefined : category}
                >
                  {opts.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(value) => handleSelect(value)}
                      className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          Array.isArray(value) && value.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {category !== Object.keys(filteredOptions).slice(-1)[0] && (
                  <CommandSeparator />
                )}
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}