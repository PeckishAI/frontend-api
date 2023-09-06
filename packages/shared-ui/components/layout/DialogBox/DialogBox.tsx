import { useTranslation } from 'react-i18next';
import LottieFile from '../../Lottie/Lottie';
import './style.scss';

type Props = {
  type: 'warning' | 'info' | 'error';
  msg: string;
  subMsg?: string;
  list?: string[];
  revele: boolean;
  onRequestClose: () => void;
  onConfirm?: () => void;
};

const DialogBox = (props: Props) => {
  const { t } = useTranslation('common');
  if (!props.revele) {
    return null;
  }
  return (
    <div className="popup-container">
      <div className="overlay" onClick={props.onRequestClose}></div>
      <div className="popup">
        {props.type === 'info' && <LottieFile width="80px" type="info" />}
        {props.type === 'warning' && <LottieFile width="80px" type="warning" />}
        {props.type === 'error' && <LottieFile width="80px" type="error" />}
        <span className="msg1">{props.msg}</span>
        {props.subMsg && <span className="msg2">{props.subMsg}</span>}
        {props.list && (
          <ul className="list">
            {props.list.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        <div className="button-container">
          {['error', 'info'].includes(props.type) && (
            <button onClick={props.onRequestClose} className="cancel">
              {t('ok')}
            </button>
          )}
          {props.type === 'warning' && (
            <>
              <button onClick={props.onRequestClose} className="cancel">
                {t('cancel')}
              </button>
              <button onClick={props.onConfirm} className="confirm">
                {t('confirm')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
