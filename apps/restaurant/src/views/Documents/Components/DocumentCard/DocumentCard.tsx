import './style.scss';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../../../store/useRestaurantStore';
import { formatCurrency } from '../../../../utils/helpers';
import { FaCheckCircle, FaRegCircle, FaSync } from 'react-icons/fa';
import { useEffect, useState } from 'react';

type Props = {
  uuid?: string;
  supplier?: string;
  date?: string;
  image?: string;
  path?: string;
  amount?: number;
  onClick: () => void;
  isSelected: boolean;
  showSyncStatus: boolean;
  toggleSelection: () => void;
  onButtonClick: () => void;
};

const DocumentCard = (props: Props) => {
  const {
    onClick,
    image,
    supplier,
    date,
    amount,
    showSyncStatus,
    toggleSelection,
    isSelected,
    onButtonClick,
  } = props;
  const { currencyISO } = useRestaurantCurrency();
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(
    []
  );
  const { restaurants } = useRestaurantStore((state) => ({
    loadRestaurants: state.loadRestaurants,
    restaurants: state.restaurants,
  }));
  useEffect(() => {
    if (restaurants.length > 0) {
      const integrations: string[] = [];
      restaurants.forEach((restaurant) => {
        restaurant.provider.forEach((provide) => {
          if (provide.xero) {
            integrations.push('Xero');
          }
        });
      });
      setConnectedIntegrations(integrations);
    }
  }, [restaurants]);

  const hasXeroIntegration = connectedIntegrations.includes('Xero');

  return (
    <div className="document-card" onClick={onClick}>
      <div className="logo-container"></div>
      <div className="document-info">
        <p className="supplier">{supplier}</p>
        <p className="date">{date}</p>
        <p className="price">{formatCurrency(amount, currencyISO)}</p>
        {hasXeroIntegration &&
          (!showSyncStatus ? (
            <>
              <div
                className="check-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection();
                }}>
                {isSelected ? <FaCheckCircle /> : <FaRegCircle />}
              </div>

              <FaSync
                className="sync-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick();
                }}
              />
            </>
          ) : (
            <FaSync
              className="sync-icon disabled"
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default DocumentCard;
