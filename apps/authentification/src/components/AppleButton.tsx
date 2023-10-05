import AppleLogin from 'react-apple-login';
import authService, { LogInResult } from '../services/auth.service';
import { useTranslation } from 'react-i18next';
import { FaApple } from 'react-icons/fa';
import { GLOBAL_CONFIG } from 'shared-config';

type Props = {
  type: 'sign-in' | 'sign-up';
  handleRequest: (apiCall: Promise<LogInResult>) => void;
  setErrorMessage: (message: string) => void;
};

export const AppleButton = (props: Props) => {
  const { t } = useTranslation(['error', 'common']);

  return (
    <AppleLogin
      redirectURI="https://a21d-178-132-215-44.ngrok-free.app/sign-in"
      // redirectURI={GLOBAL_CONFIG.authentificationUrl + '/sign-in'}
      clientId={GLOBAL_CONFIG.APPLE_CLIENT_ID}
      scope="email name"
      usePopup
      responseMode="query"
      callback={(res) => {
        if (res.error) {
          console.log('Error apple login', res.error);

          switch (res.error.error) {
            case 'popup_closed_by_user':
              props.setErrorMessage(t('error:apple-auth.aborted'));
              break;
            default:
              props.setErrorMessage(t('error:apple-auth.failed'));
              break;
          }
          return;
        }

        props.handleRequest(
          authService.appleLogIn(
            res.authorization.id_token,
            res?.user?.name ?? null
          )
        );
      }}
      render={(renderProps) => (
        <button
          type="button"
          disabled={renderProps.disabled}
          onClick={renderProps.onClick}
          className="apple-button">
          <FaApple
            size={20}
            style={{
              marginBottom: 3,
            }}
          />
          {t(`common:${props.type}-apple`)}
        </button>
      )}
    />
  );
};
