import { useTranslation } from 'react-i18next';
import LottieFile from '../../Lottie/Lottie';
import './style.scss';
import { useState } from 'react';
import Button from '../../Button/Button';

type Props = {
  type: 'warning' | 'info' | 'error';
  msg: string;
  subMsg?: string;
  list?: string[];
  isOpen: boolean;
  onRequestClose: () => void;
  disabledConfirm?: boolean;
  onConfirm?: () => void | Promise<void>;
  children?: React.ReactNode; // Add children prop
};

const DialogBox = (props: Props) => {
  const { t } = useTranslation('common');

  const [isSubmitLoading, setSubmitLoading] = useState(false);

  if (!props.isOpen) {
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
        <div className="button-container">{props.children}</div>
        <div className="button-container">
          {['error', 'info'].includes(props.type) && (
            <Button
              type="primary"
              value={t('ok')}
              onClick={props.onRequestClose}
            />
          )}
          {props.type === 'warning' && (
            <>
              <Button
                type="secondary"
                value={t('cancel')}
                onClick={props.onRequestClose}
              />
              <Button
                value={t('confirm')}
                type="primary"
                loading={isSubmitLoading}
                onClick={() => {
                  const result = props.onConfirm && props.onConfirm();
                  if (result && result instanceof Promise) {
                    setSubmitLoading(true);
                    result.finally(() => {
                      setSubmitLoading(false);
                    });
                  }
                }}
                disabled={props.disabledConfirm}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
