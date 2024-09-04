import React, { useState, useEffect } from 'react';
import TransferHistorySection from './components/TransferHistorySection';
import { transferService } from '../../../services/transfer.service';
import { useRestaurantStore } from '../../../store/useRestaurantStore';

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  amount: number;
};

type TransferEvent = {
  fromSite: string;
  toSite: string;
  transferDate: string;
  transferredBy: string;
  transferAmount: number;
  ingredients: Ingredient[];
};

export const TransferTab = () => {
  const [transferEvents, setTransferEvents] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  // Fetch transfer history when restaurantUUID changes
  useEffect(() => {
    if (!selectedRestaurantUUID) return;

    const fetchTransferHistory = async () => {
      setLoading(true); // Start loading when the request begins
      try {
        const data = await transferService.getTransferHistory(
          selectedRestaurantUUID
        );
        const formattedData = data.map((item: any) => item.transfer_event); // Assuming each item has a `transfer_event` field
        setTransferEvents(formattedData);
        setError(null); // Clear error on successful fetch
      } catch (err) {
        console.error('Failed to fetch transfer history:', err);
        setError('Failed to fetch transfer history');
      } finally {
        setLoading(false); // End loading when the request completes
      }
    };

    fetchTransferHistory();
  }, [selectedRestaurantUUID]); // Add restaurantUUID as a dependency to re-fetch data when it changes

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {transferEvents.length > 0 ? (
        transferEvents.map((event, index) => (
          <TransferHistorySection key={index} event={event} />
        ))
      ) : (
        <div>No transfer history available.</div>
      )}
    </div>
  );
};
