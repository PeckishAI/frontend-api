import './style.scss';
import Lottie from '../Lottie/Lottie';

type Props = {
  size?: 'small' | 'medium' | 'large';
};

export const Loading = (props: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Lottie
        type="loading"
        width={
          props.size === 'small'
            ? '50px'
            : props.size === 'medium'
            ? '100px'
            : '150px'
        }
      />
    </div>
  );
};

export const LoadingAbsolute = () => {
  return (
    <div className="loading-container">
      <Lottie type="loading" width="150px" />
    </div>
  );
};
