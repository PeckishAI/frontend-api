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
  const { currencyISO } = useRestaurantCurrency();

  return (
    <div className="document-card" onClick={props.onClick}>
      <div className="logo-container">
        <img className="logo-integrations" src={props.image}></img>
      </div>
      <div className="document-info">
        <p className="supplier">{props.supplier}</p>
        <p className="date">{props.date}</p>
        <p className="price">{formatCurrency(props.amount, currencyISO)}</p>
        {props.show && (
          <>
            <div
              className="check-icon"
              onClick={(e) => {
                e.stopPropagation();
                props.toggleSelection();
              }}>
              {props.isSelected ? <FaCheckCircle /> : <FaRegCircle />}
            </div>

            <FaSync
              className="sync-icon"
              onClick={(e) => {
                e.stopPropagation(); // To prevent the click event from bubbling up to the parent div
                props.onButtonClick();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
