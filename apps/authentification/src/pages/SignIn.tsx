import { useState } from 'react';
import { MdAlternateEmail } from 'react-icons/md';
import { FaLock } from 'react-icons/fa';
import { Button, LabeledInput, Checkbox } from 'shared-ui';
import { useForm } from 'react-hook-form';
import authService, { LogInResult } from '../services/auth.service';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { handleAuthentification } from '../utils';
import { GoogleButton } from '../components/GoogleButton';
import { AppleButton } from '../components/AppleButton';

const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'email-required' })
    .email('error:valid-email'),
  password: z.string().min(1, { message: 'error:password-required' }),
});

type SignInForm = z.infer<typeof SignInSchema>;

export const SignIn = () => {
  const { t } = useTranslation(['error', 'common']);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
  });

  const handleLogin = async (apiCall: Promise<LogInResult>) => {
    setLoading(true);

    return apiCall
      .then((res) => {
        console.log('Login success => token ', res.data.access_token);
        if (!res.data.user.client_type) {
          navigate('/choose-usage', {
            state: res.data,
          });
        } else {
          handleAuthentification(
            res.data.access_token,
            res.data.user.client_type
          );
        }
      })
      .catch((err) => {
        if (isAxiosError(err) && err.response) {
          switch (err.response.status) {
            case 404:
              setErrorMessage(t('error:sign-in.account-not-found'));
              break;
            case 401:
              setErrorMessage(t('error:sign-in.bad-credentials'));
              break;
            case 400:
              setErrorMessage(t('error:unknown-error'));
              break;
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const onSubmit = handleSubmit((data) => {
    if (isSubmitting) return;
    return handleLogin(authService.logIn(data.email, data.password));
  });

  return (
    <main className="Auth">
      <div className="image-section">
        <img />
      </div>
      <div className="form-section">
        <h1 className="company-name">peckish</h1>

        <h1 className="title">{t('common:sign-in.title')}</h1>
        <p className="description">{t('common:sign-in.description')}</p>
        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <form className="inputs-container" onSubmit={onSubmit}>
          <LabeledInput
            placeholder={t('common:email')}
            type="text"
            autoComplete="email"
            icon={<MdAlternateEmail size={16} />}
            {...register('email')}
            error={errors.email?.message}
          />
          <LabeledInput
            placeholder={t('common:password')}
            type="password"
            autoComplete="current-password"
            icon={<FaLock size={16} />}
            {...register('password')}
            error={errors.password?.message}
          />
          <div className="remember-me-container">
            <Checkbox
              label={t('common:remember-me')}
              checked={rememberMe}
              onCheck={setRememberMe}
            />
            <div
              className="forget-password-button"
              onClick={() => navigate('/email-reset-password')}>
              {t('common:forgot-password')}
            </div>
          </div>

          <Button
            type="primary"
            actionType="submit"
            value={t('common:sign-in')}
            className="submit"
            loading={loading}
          />

          <div className="or">
            <span>{t('common:or')}</span>
          </div>

          <GoogleButton
            type="sign-in"
            handleRequest={handleLogin}
            setErrorMessage={setErrorMessage}
          />

          <AppleButton
            type="sign-in"
            handleRequest={handleLogin}
            setErrorMessage={setErrorMessage}
          />

          <p className="create-account">
            {t('common:sign-in.create-account')}{' '}
            <Link to={'/sign-up'}>{t('common:sign-up')}</Link>
          </p>
        </form>
      </div>
    </main>
  );
};
