import { useState } from 'react';
import { ChartBar, Package2, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { DateRange } from "react-day-picker";
import SubSectionNav from "@/components/layout/SubSectionNav";
import { Card, CardContent } from "@/components/ui/card";
import { SalesChart, CustomerChart } from "@/components/charts/OverviewCharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
import styles from "./General.module.css";

interface StatCardProps {
  label: string;
  value: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  comparison: string;
}

function StatCard({ label, value, trend, comparison }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{label}</span>
          <div className={styles.statValue}>
            <span className={styles.statNumber}>{value}</span>
            {trend && (
              <span className={cn(styles.statTrend, {
                [styles.statTrendUp]: trend.direction === 'up',
                [styles.statTrendDown]: trend.direction === 'down',
                [styles.statTrendNeutral]: trend.direction === 'neutral',
              })}>
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '-'}{trend.value}
              </span>
            )}
          </div>
          <span className={styles.statCompare}>{comparison}</span>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <div className={styles.container}>
      <div className={styles.content}>
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className={styles.datePickerContainer}>
          <DateRangePicker date={date} onSelect={setDate} />
        </div>

        <div className={styles.mainContent}>
          {activeSection === 'overview' && (
            <div className={styles.overviewSection}>
              <div className={styles.statsGrid}>
                <StatCard
                  label="Total Sales"
                  value="$252.25"
                  trend={{ value: "20%", direction: "down" }}
                  comparison="Compared to Jan 1-Dec 31, 2020"
                />
                <StatCard
                  label="Online Store Sessions"
                  value="14"
                  trend={{ value: "600%", direction: "up" }}
                  comparison="Compared to previous period"
                />
                <StatCard
                  label="Returning Customer Rate"
                  value="16.67%"
                  trend={{ value: "-", direction: "neutral" }}
                  comparison="First time vs returning"
                />
                <StatCard
                  label="Total Orders"
                  value="13"
                  trend={{ value: "225%", direction: "up" }}
                  comparison="Last 30 days"
                />
              </div>

              <div className={styles.chartsGrid}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className={styles.chartTitle}>Sales Over Time</h3>
                    <SalesChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className={styles.chartTitle}>Customer Analytics</h3>
                    <CustomerChart />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className={styles.sectionContent}>
              <p className={styles.sectionMessage}>Inventory section coming soon...</p>
            </div>
          )}

          {activeSection === 'procurement' && (
            <div className={styles.sectionContent}>
              <p className={styles.sectionMessage}>Procurement section coming soon...</p>
            </div>
          )}

          {activeSection === 'menu' && (
            <div className={styles.sectionContent}>
              <p className={styles.sectionMessage}>Menu section coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
