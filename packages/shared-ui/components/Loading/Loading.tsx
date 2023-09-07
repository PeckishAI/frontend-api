import './style.scss';
import Lottie from '../Lottie/Lottie';

const Loading = () => {
  return (
    <div className="loading-container">
      <Lottie type="loading" width="200px" />
    </div>
  );
};

export default Loading;
