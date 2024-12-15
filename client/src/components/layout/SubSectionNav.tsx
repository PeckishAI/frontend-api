import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface SubSection {
  id: string;
  label: string;
}

interface SubSectionNavProps {
  sections: SubSection[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SubSectionNav({
  sections,
  activeSection,
  onSectionChange,
}: SubSectionNavProps) {
  return (
    <div className="border-b -mt-1">
      <Tabs value={activeSection} onValueChange={onSectionChange}>
        <TabsList className="w-full justify-start bg-transparent border-b-0 px-8 py-2 mb-4">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
