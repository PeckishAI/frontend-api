import { useState } from "react";
import { FileText, FileBox, ClipboardCheck } from "lucide-react";
import SubSectionNav from "@/components/layout/SubSectionNav";
import InvoicesView from "@/components/documents/InvoicesView";
import StocktakesView from "@/components/documents/StocktakesView";

export default function Documents() {
  const [activeSection, setActiveSection] = useState("invoices");

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

        <div className="px-8 pb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {activeSection === "invoices" && <InvoicesView />}

            {activeSection === "delivery-notes" && (
              <div className="p-6">
                <p className="text-gray-600">Delivery notes section coming soon...</p>
              </div>
            )}

            {activeSection === "stocktakes" && <StocktakesView />}
          </div>
        </div>
      </div>
    </div>
  );
}