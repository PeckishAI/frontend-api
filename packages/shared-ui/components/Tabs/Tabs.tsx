import './tabs.scss';

type Props = {
  tabs: Array<string>;
  onClick: (index: number) => void;
  selectedIndex: number;
};

const Tabs = (props: Props) => {
  return (
    <div className="tabs">
      {props.tabs.map((tab, index) => (
        <span
          key={index}
          className={index === props.selectedIndex ? 'active' : ''}
          onClick={() => props.onClick(index)}>
          {tab}
        </span>
      ))}
    </div>
  );
};

export default Tabs;
