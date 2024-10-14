import './style.scss';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../../../store/useRestaurantStore';
import { formatCurrency, prettyDateFormat } from '../../../../utils/helpers';
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
  showSyncStatus: string;
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
  const { restaurants, restaurantUUID } = useRestaurantStore((state) => ({
    loadRestaurants: state.loadRestaurants,
    restaurants: state.restaurants,
    restaurantUUID: state.selectedRestaurantUUID,
  }));
  useEffect(() => {
    if (!restaurantUUID) return;

    const selectedRestaurant = restaurants.find(
      (restaurant) => restaurant.restaurant_uuid === restaurantUUID
    );

    if (selectedRestaurant) {
      const hasXero = selectedRestaurant.provider.some(
        (provider) => provider.xero === true
      );
      setConnectedIntegrations(hasXero);
    }
  }, [restaurantUUID, restaurants]);

  return (
    <div className="document-card" onClick={onClick}>
      <div className="logo-container">
        <img className="logo-integrations" src={image[0]}></img>
      </div>
      <div className="document-info">
        <p className="supplier">{supplier}</p>
        <p className="date">{prettyDateFormat(date)}</p>
        <p className="price">{formatCurrency(amount, currencyISO)}</p>
        {connectedIntegrations &&
          (showSyncStatus !== 'true' ? (
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
