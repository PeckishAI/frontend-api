import { useGoogleLogin } from '@react-oauth/google';
import authService, { LogInResult } from '../services/auth.service';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';

type Props = {
  type: 'sign-in' | 'sign-up';
  handleRequest: (apiCall: Promise<LogInResult>) => void;
  setErrorMessage: (message: string) => void;
};

export const GoogleButton = (props: Props) => {
  const { t } = useTranslation(['error', 'common']);

  const googleLogin = useGoogleLogin({
    onSuccess: (res) => {
      if (props.type === 'sign-in') {
        props.handleRequest(authService.googleLogIn(res.access_token));
      } else {
        props.handleRequest(authService.googleRegister(res.access_token));
      }
    },
    onNonOAuthError: () => {
      props.setErrorMessage(t('error:google-auth.aborted'));
    },
    onError: () => {
      props.setErrorMessage(t('error:google-auth.failed'));
    },
  });

  return (
    <button
      type="button"
      className="google-button"
      onClick={() => googleLogin()}>
      <FcGoogle size={20} />
      {t(`common:${props.type}-google`)}
    </button>
  );
};
