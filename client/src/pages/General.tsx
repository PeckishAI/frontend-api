import { useState, useMemo } from 'react';
import { ChartBar, Package2, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { DateRange } from "react-day-picker";
import SubSectionNav from "@/components/layout/SubSectionNav";
import { Card, CardContent } from "@/components/ui/card";
import { SalesChart, CustomerChart } from "@/components/charts/OverviewCharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useQuery } from "@tanstack/react-query";
import { useRestaurantContext } from "@/contexts/RestaurantContext";
import { generalService } from "@/services/generalService";

export default function General() {
  const [activeSection, setActiveSection] = useState('overview');
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  
  const { currentRestaurant } = useRestaurantContext();
  
  const dateParams = useMemo(() => {
    if (!date?.from || !date?.to) return {};
    return {
      start_date: date.from.toISOString().split('T')[0],
      end_date: date.to.toISOString().split('T')[0]
    };
  }, [date]);

  const { data: sales } = useQuery({
    queryKey: ['sales', currentRestaurant?.restaurant_uuid, dateParams],
    queryFn: () => generalService.getRestaurantSales(currentRestaurant?.restaurant_uuid!, dateParams),
    enabled: !!currentRestaurant?.restaurant_uuid
  });

  const { data: costOfSales } = useQuery({
    queryKey: ['costOfSales', currentRestaurant?.restaurant_uuid, dateParams],
    queryFn: () => generalService.getRestaurantCostOfSales(currentRestaurant?.restaurant_uuid!, dateParams),
    enabled: !!currentRestaurant?.restaurant_uuid
  });

  const { data: inventoryValue } = useQuery({
    queryKey: ['inventoryValue', currentRestaurant?.restaurant_uuid, dateParams],
    queryFn: () => generalService.getRestaurantInventoryValue(currentRestaurant?.restaurant_uuid!, dateParams),
    enabled: !!currentRestaurant?.restaurant_uuid
  });

  const { data: procurementCost } = useQuery({
    queryKey: ['procurementCost', currentRestaurant?.restaurant_uuid, dateParams],
    queryFn: () => generalService.getRestaurantProcurementCost(currentRestaurant?.restaurant_uuid!, dateParams),
    enabled: !!currentRestaurant?.restaurant_uuid
  });

  const { data: salesBreakdown } = useQuery({
    queryKey: ['salesBreakdown', currentRestaurant?.restaurant_uuid, dateParams],
    queryFn: () => generalService.getRestaurantSalesBreakdown(currentRestaurant?.restaurant_uuid!, dateParams),
    enabled: !!currentRestaurant?.restaurant_uuid
  });

  const { data: costBreakdown } = useQuery({
    queryKey: ['costBreakdown', currentRestaurant?.restaurant_uuid, dateParams],
    queryFn: () => generalService.getRestaurantCostOfSalesBreakdown(currentRestaurant?.restaurant_uuid!, dateParams),
    enabled: !!currentRestaurant?.restaurant_uuid
  });

  const sections = [
    { id: 'overview', label: 'Overview', icon: ChartBar },
    { id: 'inventory', label: 'Inventory', icon: Package2 },
    { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
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
          <DateRangePicker date={date} onSelect={setDate} />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeSection === 'overview' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Total Sales</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">${sales?.net_sales?.toFixed(2) || '0.00'}</span>
                        {/* <span className="text-sm text-red-500">↓20%</span> */}
                      </div>
                      {/* <span className="text-xs text-muted-foreground">Compared to previous period</span> */}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Cost of Sales</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">${costOfSales?.data?.toFixed(2) || '0.00'}</span>
                        {/* <span className="text-sm text-green-500">↑600%</span> */}
                      </div>
                      {/* <span className="text-xs text-muted-foreground">Compared to previous period</span> */}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Inventory Value</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">${inventoryValue?.data?.toFixed(2) || '0.00'}</span>
                        {/* <span className="text-sm text-neutral-500">-</span> */}
                      </div>
                      {/* <span className="text-xs text-muted-foreground">Current value</span> */}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Procurement Cost</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">${procurementCost?.data?.toFixed(2) || '0.00'}</span>
                        {/* <span className="text-sm text-green-500">↑225%</span> */}
                      </div>
                      {/* <span className="text-xs text-muted-foreground">Last 30 days</span> */}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Sales Over Time</h3>
                    {console.log('Sales data:', salesBreakdown)}
<SalesChart data={salesBreakdown || []} />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Cost of Sales Over Time</h3>
                    <SalesChart data={costBreakdown || []} type="cost" />
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
