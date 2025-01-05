
import AppleLogin from 'react-apple-login';
import { authService } from '@/services/authService';
import { Button } from 'shared-ui';
import { useTranslation } from 'react-i18next';
import { FaApple } from 'react-icons/fa';
import { GLOBAL_CONFIG } from 'shared-config';

type Props = {
  onSuccess: (data: any) => void;
  onError: (message: string) => void;
};

export const AppleButton = ({ onSuccess, onError }: Props) => {
  const { t } = useTranslation(['error', 'common']);

  return (
    <AppleLogin
      clientId={GLOBAL_CONFIG.APPLE_CLIENT_ID}
      redirectURI={GLOBAL_CONFIG.authentificationUrl}
      scope="email name"
      responseMode="query"
      render={renderProps => (
        <Button
          type="secondary"
          value={t('common:sign-in-apple')}
          onClick={renderProps.onClick}
          icon={<FaApple size={20} />}
        />
      )}
      callback={async response => {
        try {
          if (response.error) {
            onError(t('error:apple-auth.failed'));
            return;
          }
          const result = await authService.appleLogIn(response.authorization.id_token);
          onSuccess(result);
        } catch (error) {
          onError(t('error:apple-auth.failed')); 
        }
      }}
    />
  );
};
