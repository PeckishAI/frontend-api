import { useState } from 'react';
import './style.scss';
import { Button, Input } from 'shared-ui';
import { useTranslation } from 'react-i18next';

type POS = {
  name: string;
  display_name: string;
  button_display?: string;
  auth_type: string;
  oauth_url: string;
  logo_uri: string;
};

type Props = {
  isVisible: boolean;
  pos?: POS;
  toggleModal: () => void;
  onIntegrated: () => void;
};

function oauth(auth_type: string | undefined, oauth_url: string | undefined) {
  console.log(auth_type, oauth_url);
}

const LoginModal = (props: Props) => {
  const { t } = useTranslation('common');

  const [userName, setUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function FieldsValid() {
    if (!userName) {
      setError(t('field.error.userName'));
      return false;
    }
    if (!userPassword) {
      setError(t('field.error.password'));
      return false;
    }
    setError(t(''));
    return true;
  }

  function simulationRequest() {
    setLoading(false);
    props.toggleModal();
    props.onIntegrated();
  }
  const handleLoginClick = () => {
    if (FieldsValid()) {
      setLoading(true);
      setTimeout(simulationRequest, 1000);
    }
  };
  return (
    <div className={'modal ' + (props.isVisible ? ' visible' : '')}>
      <div className="modal-content">
        <h2>{props.pos?.name}</h2>
        <Input
          type="text"
          width="300px"
          value={userName}
          placeholder="Username"
          onChange={(value) => setUserName(value)}
        />
        <Input
          type="password"
          width="300px"
          value={userPassword}
          placeholder="Password"
          onChange={(value) => setUserPassword(value)}
        />
        <span className="text-error">{error}</span>
        <div className="button-container">
          <Button
            value={t('cancel')}
            type="secondary"
            onClick={props.toggleModal}
          />
          <Button
            value={'' + props.pos?.button_display}
            type="primary"
            onClick={handleLoginClick}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
