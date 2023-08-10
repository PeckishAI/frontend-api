import './style.scss';

type Props = {
  name: string;
  description: string;
  image: string;
  onClick: () => void;
};

const Card = (props: Props) => {
  return (
    <div className="card" onClick={props.onClick}>
      <h2>{props.name}</h2>
      <p>{props.description}</p>
      <img src={props.image}></img>
    </div>
  );
};

export default Card;
