import './style.scss';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared-ui';

type Props = {
  onCancelClick: () => void;
  onValidateClick: () => void;
};

const UploadCsv = (props: Props) => {
  const { t } = useTranslation('common');

  return (
    <div className="upload-popup">
      <div className="overlay"></div>
      <div className="popup">
        <div className="button-container">
          <Button
            value={t('cancel')}
            type="secondary"
            onClick={props.onCancelClick}
          />
          <Button
            value={t('validate')}
            type="primary"
            onClick={props.onValidateClick}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadCsv;
