import './style.scss';
import { Button, Popup } from 'shared-ui';
import { useTranslation } from 'react-i18next';

type Props = {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationPopup = (props: Props) => {
  const { t } = useTranslation(['common', 'validation', 'onboarding']);

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onCancel}
      title={props.title}
      subtitle={props.message}>
      <div className="modal-content">
        <div className="button-container">
          <Button
            value={t('cancel')}
            type="secondary"
            onClick={props.onCancel}
          />
          <Button
            value={t('confirm')}
            type="primary"
            onClick={props.onConfirm}
          />
        </div>
      </div>
    </Popup>
  );
};

export default ConfirmationPopup;
