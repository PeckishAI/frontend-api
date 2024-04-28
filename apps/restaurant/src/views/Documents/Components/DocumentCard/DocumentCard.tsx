import './style.scss';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';
import { formatCurrency } from '../../../../utils/helpers';

type Props = {
  uuid?: string;
  supplier?: string;
  date?: string;
  image?: string;
  path?: string;
  amount?: number;
  onClick: () => void;
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
      </div>
    </div>
  );
};

export default DocumentCard;
