
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '@/services/authService';
import { Button } from 'shared-ui';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';

type Props = {
  onSuccess: (data: any) => void;
  onError: (message: string) => void;
};

export const GoogleButton = ({ onSuccess, onError }: Props) => {
  const { t } = useTranslation(['error', 'common']);
  
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const result = await authService.googleLogIn(response.access_token);
        onSuccess(result);
      } catch (error) {
        onError(t('error:google-auth.failed'));
      }
    },
    onError: () => {
      onError(t('error:google-auth.failed'));
    },
  });

  return (
    <Button
      type="secondary"
      value={t('common:sign-in-google')}
      onClick={() => login()}
      icon={<FcGoogle size={20} />}
    />
  );
};
