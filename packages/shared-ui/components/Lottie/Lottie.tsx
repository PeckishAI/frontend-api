import Lottie from 'react-lottie';
import validate from '../../asset/lotties/validate.json';
import error from '../../asset/lotties/error.json';
import info from '../../asset/lotties/info.json';
import loading from '../../asset/lotties/loading.json';
import warning from '../../asset/lotties/warning.json';

type Props = {
  type: 'error' | 'info' | 'loading' | 'validate' | 'warning';
  width: string;
};

const LottieFile = (props: Props) => {
  return (
    <div style={{ width: props.width }} className="lottie-container">
      {props.type === 'error' && (
        <Lottie
          options={{ animationData: error, autoplay: true, loop: true }}
        />
      )}
      {props.type === 'info' && (
        <Lottie options={{ animationData: info, autoplay: true, loop: true }} />
      )}
      {props.type === 'loading' && (
        <Lottie
          options={{ animationData: loading, autoplay: true, loop: true }}
        />
      )}
      {props.type === 'validate' && (
        <Lottie
          options={{ animationData: validate, autoplay: true, loop: false }}
        />
      )}
      {props.type === 'warning' && (
        <Lottie
          options={{ animationData: warning, autoplay: true, loop: true }}
        />
      )}
    </div>
  );
};

export default LottieFile;
