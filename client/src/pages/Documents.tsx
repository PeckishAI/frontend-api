import { useState } from 'react';
import { AlertCircle, FileText, FileBox, ClipboardCheck } from "lucide-react";
import SubSectionNav from "@/components/layout/SubSectionNav";
import { Card, CardContent } from "@/components/ui/card";

export default function Documents() {
  const [activeSection, setActiveSection] = useState('invoices');

  const sections = [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'delivery-notes', label: 'Delivery Notes', icon: FileBox },
    { id: 'stocktakes', label: 'Stocktakes', icon: ClipboardCheck },
  ];

  return (
    <div className="p-8 ml-64 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold text-gray-900">Documents</h1>
        </div>

        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeSection === 'invoices' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>Invoices section coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'delivery-notes' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>Delivery notes section coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'stocktakes' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>Stocktakes section coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
