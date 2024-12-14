import { useState } from 'react';
import { ChartBar, Package2, ShoppingCart, UtensilsCrossed } from "lucide-react";
import SubSectionNav from "@/components/layout/SubSectionNav";
import { Card, CardContent } from "@/components/ui/card";

export default function General() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: ChartBar },
    { id: 'inventory', label: 'Inventory', icon: Package2 },
    { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  ];

  return (
    <div className="p-8 ml-64 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <ChartBar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold text-gray-900">General</h1>
        </div>

        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeSection === 'overview' && (
            <div className="p-6">
              <p className="text-gray-600">Overview section coming soon...</p>
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className="p-6">
              <p className="text-gray-600">Inventory section coming soon...</p>
            </div>
          )}

          {activeSection === 'procurement' && (
            <div className="p-6">
              <p className="text-gray-600">Procurement section coming soon...</p>
            </div>
          )}

          {activeSection === 'menu' && (
            <div className="p-6">
              <p className="text-gray-600">Menu section coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
