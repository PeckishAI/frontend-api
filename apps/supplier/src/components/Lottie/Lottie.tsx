import Lottie from 'react-lottie';
import validate from '../../assets/lotties/validate.json';
type Props = {
  //   lottie: string;
  //   width: number;
};

const LottieFile = (props: Props) => {
  return (
    <div>
      <Lottie
        options={{ animationData: validate, autoplay: true, loop: false }}
      />
    </div>
  );
};

export default LottieFile;
