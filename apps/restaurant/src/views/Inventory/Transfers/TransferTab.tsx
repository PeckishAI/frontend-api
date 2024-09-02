import React from 'react';
import TransferHistorySection from './components/TransferHistorySection';

export type TransferTabRef = {
  renderOptions: () => React.ReactNode;
};

const transferEvents = [
  {
    fromSite: 'Site A',
    toSite: 'Site B',
    transferDate: '23 Jun 2024',
    transferredBy: 'John Doe',
    ingredients: [
      { name: 'Tomato', quantity: 20, unit: 'kg' },
      { name: 'Cheese', quantity: 5, unit: 'kg' },
    ],
  },
  {
    fromSite: 'Site B',
    toSite: 'Site D',
    transferDate: '25 Jun 2024',
    transferredBy: 'Jane Smith',
    ingredients: [
      { name: 'Lettuce', quantity: 10, unit: 'kg' },
      { name: 'Bread', quantity: 30, unit: 'pcs' },
    ],
  },
];

export const TransferTab = () => {
  return (
    <div>
      {transferEvents.map((event, index) => (
        <TransferHistorySection key={index} event={event} />
      ))}
    </div>
  );
};
