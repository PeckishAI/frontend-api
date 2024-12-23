// Table.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Table, { ColumnDefinitionType } from './Table';

// Define sample data type matching the generic constraints
interface SampleData {
  id: number;
  name: string;
  status: string;
  amount: number;
}

const meta = {
  title: 'SharedUI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const sampleData: SampleData[] = [
  { id: 1, name: 'John Doe', status: 'Active', amount: 1000 },
  { id: 2, name: 'Jane Smith', status: 'Inactive', amount: 2000 },
  { id: 3, name: 'Bob Johnson', status: 'Active', amount: 3000 },
  { id: 4, name: 'Alice Brown', status: 'Pending', amount: 4000 },
];

// Column definitions
const columns: ColumnDefinitionType<SampleData>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    renderItem: ({ value }) => {
      const status = value as string;
      return (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor:
              status === 'Active'
                ? '#e6ffe6'
                : status === 'Inactive'
                ? '#ffe6e6'
                : '#fff9e6',
            color:
              status === 'Active'
                ? '#006600'
                : status === 'Inactive'
                ? '#660000'
                : '#666600',
          }}>
          {status}
        </span>
      );
    },
  },
  {
    key: 'amount',
    header: 'Amount',
    renderItem: ({ value }) => `$${(value as number).toLocaleString()}`,
  },
];

// Basic usage
export const Basic: Story = {
  args: {
    data: sampleData,
    columns,
  },
};

// With custom rendering
export const WithCustomRendering: Story = {
  args: {
    data: sampleData,
    columns,
  },
};

// Scrollable table
export const Scrollable: Story = {
  args: {
    data: [...sampleData, ...sampleData, ...sampleData],
    columns,
    scrollable: true,
    maxHeight: '300px',
  },
};

// With row click handler
export const WithRowClick: Story = {
  args: {
    data: sampleData,
    columns,
    onRowClick: (row: SampleData) => alert(`Clicked row with ID: ${row.id}`),
  },
};
