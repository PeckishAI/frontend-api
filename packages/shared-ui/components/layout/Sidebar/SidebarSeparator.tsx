import './sidebarSeparator.scss';

type Props = {
  sectionName: string;
};

const SidebarSeparator = (props: Props) => {
  return (
    <div className="sidebar-separator">
      <span>{props.sectionName}</span>
    </div>
  );
};

export default SidebarSeparator;
