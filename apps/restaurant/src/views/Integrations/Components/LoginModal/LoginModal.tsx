import { useEffect, useState } from 'react';
import './style.scss';
import { Button, LabeledInput, Lottie, Popup } from 'shared-ui';
import { useTranslation } from 'react-i18next';
import { axiosClient, axiosIntegrationClient } from '../../../../services';
import { useUserStore } from '@peckishai/user-management';
import { POS, Integration } from '../../Integrations';
import { useOAuth2 } from '../../../../utils/oauth/useOAuth2';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import RedCatModal from '../RedCat/RedCatModal';

type Props = {
  isVisible: boolean;
  pos?: POS;
  toggleModal: () => void;
  onIntegrated: (integration?: Integration) => void;
};

const LoginModal = (props: Props) => {
  const { t } = useTranslation(['common', 'validation', 'onboarding']);
  const userId = useUserStore((state) => state.user?.user.user_uuid);

  const [commonModalVisible, setCommonModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);

  const [userName, setUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [errorField, setErrorField] = useState('');
  const [retrieveDataStatus, setRetrieveDataStatus] = useState<
    'loading' | 'success' | 'fail' | null
  >(null);
  const [integrated, setIntegrated] = useState<Integration>();

  const { selectedRestaurantUUID } = useRestaurantStore();

  const redCatModal = () => {
    setCommonModalVisible(!commonModalVisible);
    setRetrieveDataStatus(null);
  };

  const { getAuth, error, loading, data } = useOAuth2({
    authorizeUrl:
      props.pos?.name === 'xero'
        ? `${props.pos?.data?.oauth_url}/${selectedRestaurantUUID}`
        : props.pos?.data?.oauth_url ?? '',
    clientId: props.pos?.data?.client_id ?? '',
    redirectUri: window.location.origin + '/oauth/callback',
    scope: props.pos?.data?.scope ?? '',
  });

  function FieldsValid() {
    if (!userName) {
      setErrorField(t('validation:field.error.userName'));
      return false;
    }
    if (!userPassword) {
      setErrorField(t('validation:field.error.password'));
      return false;
    }
    setErrorField('');
    return true;
  }

  useEffect(() => {
    if (error) {
      setRetrieveDataStatus('fail');
      return;
    }

    if (data && data.code) {
      axiosClient
        .post(props.pos?.url + '/integrate/' + userId, {
          code: data.code,
          redirect_uri: window.location.origin + '/oauth/callback',
        })
        .then((res) => {
          setRetrieveDataStatus('success');
        })
        .catch(() => {
          setRetrieveDataStatus('fail');
        });
    }
  }, [data, error, props.pos]);

  const handleLoginClick = () => {
    if (props.pos?.auth_type === 'oauth') {
      setRetrieveDataStatus('loading');
      if (props.pos?.name === 'toast') {
        window.location.href = `${props.pos?.data?.oauth_url}`;
      } else if (props.pos?.name === 'xero') {
        window.location.href = `${props.pos?.data?.oauth_url}/${selectedRestaurantUUID}`;
      } else {
        getAuth();
      }
      return;
    }

    if (FieldsValid() && userId) {
      let integrationUrl;
      let client;
      if (props.pos?.name === 'red_cat') {
        integrationUrl = `/pos/red-cat/list-stores/${userId}`;
        client = axiosIntegrationClient;
      } else if (props.pos?.name === 'vitamojo') {
        integrationUrl = `/pos/vitamojo/list-stores/${userId}`;
        client = axiosIntegrationClient;
      } else {
        integrationUrl = `${props?.pos?.url}/integrate/${userId}`;
        client = axiosClient;
      }

      setRetrieveDataStatus('loading');

      client
        .post(integrationUrl, {
          username: userName,
          password: userPassword,
        })
        .then((res) => {
          if (props.pos?.name === 'red_cat' || props.pos?.name === 'vitamojo') {
            setCommonModalVisible(true);
            setModalData(res);
          } else {
            setIntegrated({
              name: res.data[0],
              restaurantNumber: res.data.length,
            });
            setRetrieveDataStatus('success');
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        })
        .catch((err) => {
          console.log(err);
          setRetrieveDataStatus('fail');
        })
        .finally(() => {});
    }
  };

  return (
    <>
      <Popup
        isVisible={props.isVisible}
        onRequestClose={props.toggleModal}
        title={t('onboarding:onboarding.modal.title')}
        subtitle={t(
          props.pos?.auth_type === 'modal'
            ? 'onboarding:onboarding.modal.description.login'
            : 'onboarding:onboarding.modal.description.oauth',
          { name: props.pos?.display_name }
        )}>
        {retrieveDataStatus === null ? (
          <div className="modal-content">
            {props.pos?.auth_type !== 'oauth' ? (
              <>
                <LabeledInput
                  type="text"
                  value={userName}
                  placeholder="Username"
                  onChange={(e) => setUserName(e.target.value)}
                  lighter
                />
                <LabeledInput
                  type="password"
                  value={userPassword}
                  placeholder="Password"
                  onChange={(e) => setUserPassword(e.target.value)}
                  lighter
                />
              </>
            ) : (
              <p>
                {t('onboarding:onboarding.modal.description.oauth.message', {
                  name: props.pos.display_name,
                })}
              </p>
            )}
            {errorField && <span className="text-error">{errorField}</span>}
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
                  {t('onboarding:onboarding.recoverData')}
                </span>
                <span className="loading-info">
                  {t('onboarding:onboarding.wait')}
                </span>
              </>
            ) : retrieveDataStatus === 'success' ? (
              <>
                <Lottie type="validate" width="100px" />
                <span className="loading-info" id="bold">
                  {t('onboarding:onboarding.success')}
                </span>
                <Button
                  value={t('ok')}
                  type="secondary"
                  onClick={() => {
                    props.toggleModal();
                    props.onIntegrated(integrated);
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
                  {t('onboarding:onboarding.error')}
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
      <RedCatModal
        isVisible={commonModalVisible}
        pos={props.pos}
        setCommonModalVisible={setCommonModalVisible}
        LoginModal={props.toggleModal}
        toggleModal={redCatModal}
        setRetrieveDataStatus={setRetrieveDataStatus}
        modalData={modalData}
      />
    </>
  );
};

export default LoginModal;
