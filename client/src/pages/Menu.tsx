import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SubSectionNav from "@/components/layout/SubSectionNav";

export default function Menu() {
  const [activeSection, setActiveSection] = useState('products');

  const sections = [
    { id: 'products', label: 'Products' },
    { id: 'modifiers', label: 'Modifiers' },
    { id: 'preparations', label: 'Preparations' },
  ];

  return (
    <div className="p-8 ml-64 w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Menu</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New {activeSection.slice(0, -1)}
          </Button>
        </div>

        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {activeSection === 'products' && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            <p className="text-gray-600">Products section coming soon...</p>
          </div>
        )}

        {activeSection === 'modifiers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            <p className="text-gray-600">Modifiers section coming soon...</p>
          </div>
        )}

        {activeSection === 'preparations' && (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            <p className="text-gray-600">Preparations section coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
