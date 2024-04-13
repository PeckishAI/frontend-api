import { Menu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import './style.scss';
import { Customer } from '../../views/Customers/Customers';

type Props = {
  customer: Customer;
  onClick: () => void;
  onRemove: () => void;
};

const CustomerCard = (props: Props) => {
  const handleOptionsClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  return (
    <div className="customer-card" onClick={props.onClick}>
      <Menu
        onItemClick={(e) => e.syntheticEvent.stopPropagation()}
        menuButton={
          <i
            className="fa-solid fa-ellipsis-vertical"
            onClick={handleOptionsClick}></i>
        }
        transition>
        <MenuItem
          onClick={(e) => {
            props.onRemove();
          }}
          style={{ color: 'red' }}
          disabled>
          Remove
        </MenuItem>
        <MenuItem disabled>Edit</MenuItem>
      </Menu>

      <span className="name">{props.customer.name}</span>
      <p className="location">
        {props.customer.address}, {props.customer.city},{' '}
        {props.customer.country}
      </p>
      <div className="data">
        <span className="label">
          Open orders: <span className="value">Yes</span>
        </span>
        <span className="label">
          Past orders: <span className="value">12</span>
        </span>
      </div>
    </div>
  );
};

export default CustomerCard;
