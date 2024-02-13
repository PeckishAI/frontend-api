import './style.scss';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';

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
      <div className="name-login">
        <div className="left-side">
          <h2>{props.supplier}</h2>
          <p>{props.date}</p>
        </div>
        <div className="right-side">
          <p>
            {props.amount} {currencyISO}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
