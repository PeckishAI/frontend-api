import { useState } from 'react';
import './style.scss';
import { Button, Input, Lottie, Popup } from 'shared-ui';
import { useTranslation } from 'react-i18next';
import { onboardingService } from '../../../../../apps/restaurant/src/services';
import { useRestaurantStore } from '../../../../../apps/restaurant/src/store/useRestaurantStore';

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
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const [userName, setUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [errorField, setErrorField] = useState('');
  const [retrieveDataStatus, setRetrieveDataStatus] = useState<
    'loading' | 'success' | 'fail' | null
  >(null);

  function FieldsValid() {
    if (!userName) {
      setErrorField(t('field.error.userName'));
      return false;
    }
    if (!userPassword) {
      setErrorField(t('field.error.password'));
      return false;
    }
    setErrorField(t(''));
    return true;
  }

  function simulationRequest() {
    setRetrieveDataStatus('success');
  }
  const handleLoginClick = () => {
    if (FieldsValid() && selectedRestaurantUUID) {
      console.log(selectedRestaurantUUID);

      setRetrieveDataStatus('loading');
      onboardingService
        .login(selectedRestaurantUUID, {
          username: userName,
          password: userPassword,
        })
        .then((res) => {
          console.log(res);
          setRetrieveDataStatus('success');
        })
        .catch((err) => {
          console.log(err);
          setRetrieveDataStatus('fail');
        })
        .finally(() => {});
    }
  };
  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.toggleModal}
      title="New integration"
      subtitle={`Please input your credentials for ${props.pos?.name}`}>
      {retrieveDataStatus === null ? (
        <div className="modal-content">
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
          <span className="text-error">{errorField}</span>
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
            />
          </div>
        </div>
      ) : (
        <div className="retrieve-data-loading">
          {retrieveDataStatus === 'loading' ? (
            <>
              <Lottie type="loading" width="150px" />
              <span className="loading-info" id="bold">
                {t('onboarding.recoverData')}
              </span>
              <span className="loading-info">{t('onboarding.wait')}</span>
            </>
          ) : retrieveDataStatus === 'success' ? (
            <>
              <Lottie type="validate" width="100px" />
              <span className="loading-info" id="bold">
                {t('onboarding.success')}
              </span>
              <Button
                value={t('ok')}
                type="secondary"
                onClick={() => {
                  props.toggleModal();
                  props.onIntegrated();
                  setRetrieveDataStatus(null);
                  setUserName('');
                  setUserPassword('');
                }}
              />
            </>
          ) : retrieveDataStatus === 'fail' ? (
            <>
              <Lottie type="error" width="100px" />
              <span className="loading-info" id="bold">
                {t('onboarding.error')}
              </span>
              <Button
                value={t('ok')}
                type="secondary"
                onClick={() => {
                  props.toggleModal();
                  props.onIntegrated();
                  setRetrieveDataStatus(null);
                  setUserName('');
                  setUserPassword('');
                }}
              />
            </>
          ) : undefined}
        </div>
      )}
    </Popup>
  );
};

export default LoginModal;
