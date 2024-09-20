import React, { useEffect, useState } from 'react';
import TransferHistorySection from './components/TransferHistorySection';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import styles from './TransferTab.module.scss';

export const TransferTab = () => {
  const [error, setError] = useState<string | null>(null);
  const transferHistory = useRestaurantStore((state) => state.transferHistory);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const loadTransferHistory = useRestaurantStore(
    (state) => state.loadTransferHistory
  );

  // Fetch transfer history when selectedRestaurantUUID changes
  useEffect(() => {
    if (!selectedRestaurantUUID) return;

    const fetchHistory = async () => {
      try {
        await loadTransferHistory(selectedRestaurantUUID);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch transfer history:', err);
        setError('Failed to fetch transfer history');
      }
    };

    fetchHistory();
  }, [selectedRestaurantUUID, loadTransferHistory]); // Add selectedRestaurantUUID as dependency

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {transferHistory.length > 0 ? (
        transferHistory.map((event, index) => (
          <TransferHistorySection key={index} event={event} />
        ))
      ) : (
        <div>No transfer history available.</div>
      )}
    </div>
  );
};
