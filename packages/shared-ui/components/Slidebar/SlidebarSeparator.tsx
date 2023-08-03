import './SlidebarSeparator.scss';

type Props = {
  sectionName: string;
};

const SlidebarSeparator = (props: Props) => {
  return (
    <div className="slidebar-separator">
      <span>{props.sectionName}</span>
    </div>
  );
};

export default SlidebarSeparator;
