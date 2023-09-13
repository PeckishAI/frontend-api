import { Restaurant } from '../../../../restaurant/src/store/useRestaurantStore';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import './style.scss';

type Props = {
  restaurant: Restaurant;
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
          style={{ color: 'red' }}>
          Remove
        </MenuItem>
        <MenuItem>Edit</MenuItem>
      </Menu>

      <span className="name">{props.restaurant.name}</span>
      <p className="location">
        {props.restaurant.address}, {props.restaurant.city},{' '}
        {props.restaurant.country}
      </p>
      <div className="data">
        <span className="label">
          Open orders: <span className="value">5</span>
        </span>
        <span className="label">
          Past orders: <span className="value">12</span>
        </span>
      </div>
    </div>
  );
};

export default CustomerCard;
