import { LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ViewToggleProps {
  current: 'cards' | 'table';
  onChange: (view: 'cards' | 'table') => void;
}

export default function ViewToggle({ current, onChange }: ViewToggleProps) {
  return (
    <ToggleGroup type="single" value={current} onValueChange={(v) => onChange(v as 'cards' | 'table')}>
      <ToggleGroupItem value="cards" aria-label="Grid view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
