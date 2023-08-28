import Lottie from 'react-lottie';
import validate from '../../asset/lotties/validate.json';
import error from '../../asset/lotties/error.json';
import empty from '../../asset/lotties/empty.json';
import info from '../../asset/lotties/info.json';
import loading from '../../asset/lotties/loading.json';
import loading_white from '../../asset/lotties/loading_white.json';
import warning from '../../asset/lotties/warning.json';

type Props = {
  type:
    | 'empty'
    | 'error'
    | 'info'
    | 'loading'
    | 'loading_white'
    | 'validate'
    | 'warning';
  width: string;
  height?: string;
};

const LottieFile = (props: Props) => {
  return (
    <div
      style={{ width: props.width, height: props.height }}
      className="lottie-container">
      {props.type === 'error' && (
        <Lottie
          isClickToPauseDisabled
          options={{ animationData: error, autoplay: true, loop: true }}
        />
      )}{' '}
      {props.type === 'empty' && (
        <Lottie
          isClickToPauseDisabled
          options={{ animationData: empty, autoplay: true, loop: true }}
        />
      )}
      {props.type === 'info' && (
        <Lottie
          isClickToPauseDisabled
          options={{ animationData: info, autoplay: true, loop: true }}
        />
      )}
      {props.type === 'loading' && (
        <Lottie
          isClickToPauseDisabled
          options={{ animationData: loading, autoplay: true, loop: true }}
        />
      )}
      {props.type === 'loading_white' && (
        <Lottie
          isClickToPauseDisabled
          options={{ animationData: loading_white, autoplay: true, loop: true }}
        />
      )}
      {props.type === 'validate' && (
        <Lottie
          isClickToPauseDisabled
          options={{ animationData: validate, autoplay: true, loop: false }}
        />
      )}
      {props.type === 'warning' && (
        <Lottie
          isClickToPauseDisabled
          options={{ animationData: warning, autoplay: true, loop: true }}
        />
      )}
    </div>
  );
};

export default LottieFile;
