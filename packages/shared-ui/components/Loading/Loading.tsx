import './style.scss';
import Lottie from '../Lottie/Lottie';

type Props = {};

const Loading = (props: Props) => {
  return (
    <div className="loading-container">
      <Lottie type="loading" width="200px" />
    </div>
  );
};

export default Loading;
