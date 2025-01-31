import './style.scss';
import classNames from 'classnames';

type Props = {
  isOpen: boolean;
  toggle: () => void;
  className?: string;
};

const BurgerMenu = (props: Props) => {
  return (
    <div
      className={classNames('burger', props.isOpen && 'open', props.className)}
      onClick={props.toggle}>
      <div className="bar leftBar"></div>
      <div className="bar"></div>
      <div className="bar rightBar"></div>
    </div>
  );
};

export default BurgerMenu;
