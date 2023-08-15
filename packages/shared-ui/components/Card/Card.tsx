import './style.scss';

type Props = {
  name: string;
  image: string;
  button_display: string;
  onClick: () => void;
};

const Card = (props: Props) => {
  return (
    <div className="card">
      <h2>{props.name}</h2>
      <img className="logo--integrations" src={props.image}></img>
      <button onClick={props.onClick}>{props.button_display}</button>
    </div>
  );
};

export default Card;
