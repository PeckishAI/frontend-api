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

  useEffect(() => {
    if (!selectedRestaurantUUID) return;
  });

  useEffect(() => {
    const fetchTransferHistory = async () => {
      try {
        const data = await transferService.getTransferHistory(
          selectedRestaurantUUID
        ); // replace with actual restaurantId
        const formattedData = data.map((item: any) => item.transfer_event); // Extract the transfer_event object
        setTransferEvents(formattedData);
      } catch (err) {
        console.error('Failed to fetch transfer history:', err);
        setError('Failed to fetch transfer history');
      } finally {
        setLoading(false);
      }
    };

    fetchTransferHistory();
  }, []);

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
