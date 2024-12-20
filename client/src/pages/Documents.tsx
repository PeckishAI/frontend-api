
import { useState } from "react";
import { FileText, FileBox, ClipboardCheck } from "lucide-react";
import ViewToggle from "@/components/orders/ViewToggle";
import SubSectionNav from "@/components/layout/SubSectionNav";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import Invoices from "./documents/Invoices";
import Stocktakes from "./documents/Stocktakes";

export default function Documents() {
  const [activeSection, setActiveSection] = useState("invoices");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { currentRestaurant } = useRestaurantContext();

  const sections = [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "delivery-notes", label: "Delivery Notes", icon: FileBox },
    { id: "stocktakes", label: "Stocktakes", icon: ClipboardCheck },
  ];

  return (
    <div className="ml-64 w-[calc(100%-16rem)]">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="px-8 mt-6 mb-6 flex items-center justify-end gap-4">
          {(activeSection === "invoices" || activeSection === "stocktakes") && (
            <ViewToggle current={viewMode} onChange={setViewMode} />
          )}
        </div>

        <div className="px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {activeSection === "invoices" && (
              <Invoices viewMode={viewMode} />
            )}

            {activeSection === "delivery-notes" && (
              <div className="p-6">
                <p className="text-gray-600">Delivery notes section coming soon...</p>
              </div>
            )}

            {activeSection === "stocktakes" && (
              <Stocktakes viewMode={viewMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
