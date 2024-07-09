import './style.scss';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';
import { formatCurrency } from '../../../../utils/helpers';
import { FaCheckCircle, FaRegCircle, FaSync } from 'react-icons/fa';

type Props = {
  uuid?: string;
  supplier?: string;
  date?: string;
  image?: string;
  path?: string;
  amount?: number;
  onClick: () => void;
  isSelected: boolean;
  show: boolean;
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
    show,
    toggleSelection,
    isSelected,
    onButtonClick,
  } = props;
  const { currencyISO } = useRestaurantCurrency();

  return (
    <div className="document-card" onClick={onClick}>
      <div className="logo-container">
        <img className="logo-integrations" src={image}></img>
      </div>
      <div className="document-info">
        <p className="supplier">{supplier}</p>
        <p className="date">{date}</p>
        <p className="price">{formatCurrency(amount, currencyISO)}</p>
        {show && (
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
                e.stopPropagation(); // To prevent the click event from bubbling up to the parent div
                onButtonClick();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
