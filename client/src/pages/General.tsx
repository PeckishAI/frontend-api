import { useState } from 'react';
import { ChartBar, Package2, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { DateRange } from "react-day-picker";
import SubSectionNav from "@/components/layout/SubSectionNav";
import { Card, CardContent } from "@/components/ui/card";
import { SalesChart, CustomerChart } from "@/components/charts/OverviewCharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export default function General() {
  const [activeSection, setActiveSection] = useState('overview');
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });

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
            <div className="p-6 space-y-6">
              <div className="flex justify-end mb-4">
                <DateRangePicker date={date} onSelect={setDate} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Total Sales</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">$252.25</span>
                        <span className="text-sm text-red-500">↓20%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Compared to Jan 1-Dec 31, 2020</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Online Store Sessions</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">14</span>
                        <span className="text-sm text-green-500">↑600%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Compared to previous period</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Returning Customer Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">16.67%</span>
                        <span className="text-sm text-neutral-500">-</span>
                      </div>
                      <span className="text-xs text-muted-foreground">First time vs returning</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Total Orders</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">13</span>
                        <span className="text-sm text-green-500">↑225%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Last 30 days</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Sales Over Time</h3>
                    <SalesChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Customer Analytics</h3>
                    <CustomerChart />
                  </CardContent>
                </Card>
              </div>
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
