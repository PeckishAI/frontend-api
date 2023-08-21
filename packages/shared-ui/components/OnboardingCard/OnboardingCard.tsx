import Button from '../Button/Button';
import './style.scss';

type Props = {
  name: string;
  image: string;
  button_display: string;
  onClick: () => void;
};

const OnboardingCard = (props: Props) => {
  return (
    <div className="onboarding-card">
      <div className="name-login">
        <h2>{props.name}</h2>
        <Button
          type="primary"
          value={props.button_display}
          onClick={props.onClick}
        />
      </div>
      <div className="logo-container">
        <img className="logo-integrations" src={props.image}></img>
      </div>
    </div>
  );
};

export default OnboardingCard;
