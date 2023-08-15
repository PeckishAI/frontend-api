import { useState } from 'react';
import { Input } from '../components/Input';
import { MdAlternateEmail } from 'react-icons/md';
import { FaLock, FaUser } from 'react-icons/fa';
import { Checkbox } from '../components/Checkbox';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { Button } from 'shared-ui';
import { useForm } from 'react-hook-form';
import authService, { LogInResult } from '../services/auth.service';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

const SignUpSchema = z
  .object({
    name: z.string().min(1, { message: 'valid-email' }),
    email: z
      .string()
      .min(1, { message: 'email-required' })
      .email('valid-email'),
    password: z.string().min(8, { message: 'password-length' }),
    // .refine(
    //   (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value),
    //   'Password must have 1 number, 1 uppercase letter, and be 8 characters long'
    // ),
    confirmPassword: z
      .string()
      .min(1, { message: 'confirm-password-required' }),
    acceptTos: z.literal<boolean>(true, {
      errorMap: () => ({ message: 'accept-tos' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'password-dont-match',
    path: ['confirmPassword'],
  });

type SignUpForm = z.infer<typeof SignUpSchema>;

export const SignUp = () => {
  const { t } = useTranslation(['common', 'error']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
  });

  const handleRegister = (apiCall: Promise<LogInResult>) => {
    setLoading(true);

    return apiCall
      .then((res) => {
        // console.log('Register success token ', res.data.access_token);
        navigate('/choose-usage', {
          state: res.data,
        });
      })
      .catch((err) => {
        if (isAxiosError(err) && err.response) {
          switch (err.response.status) {
            case 409:
              setErrorMessage(t('error:sign-up.already-taken'));
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
    return handleRegister(
      authService.register(data.name, data.email, data.password)
    );
  });

  const googleLogin = useGoogleLogin({
    onSuccess: (res) => {
      handleRegister(authService.googleRegister(res.access_token));
    },
    onNonOAuthError: () => {
      setErrorMessage(t('error:google-auth.aborted'));
    },
    onError: () => {
      setErrorMessage(t('error:google-auth.failed'));
    },
  });

  return (
    <main className="Auth">
      <div className="image-section">
        <img />
      </div>
      <div className="form-section">
        <h1 className="company-name">peckish</h1>

        <h1 className="title">{t('common:sign-up.title')}</h1>
        <p className="description">{t('common:sign-up.description')}</p>
        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <form className="inputs-container" onSubmit={onSubmit}>
          <button
            type="button"
            onClick={() => googleLogin()}
            className="google-button">
            <FcGoogle size={20} />
            {t('common:sign-up-google')}
          </button>

          <div className="or">
            <span>{t('common:or-separator')}</span>
          </div>

          <Input
            placeholder={t('common:name')}
            type="text"
            autoComplete="name"
            icon={<FaUser size={16} />}
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            placeholder={t('common:email')}
            type="text"
            autoComplete="email"
            icon={<MdAlternateEmail color="var(--primaryColor)" size={16} />}
            {...register('email')}
            error={errors.email?.message}
          />
          <div className="password-row">
            <Input
              placeholder={t('common:password')}
              type="password"
              autoComplete="new-password"
              icon={<FaLock size={16} />}
              {...register('password')}
              error={errors.password?.message}
            />
            <Input
              placeholder={t('common:confirm-password')}
              type="password"
              autoComplete="off"
              icon={<FaLock size={16} />}
              {...register('confirmPassword', {
                required: 'This field is required',
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <Checkbox
            label={t('common:sign-up.tos-checkbox')}
            {...register('acceptTos')}
            error={errors.acceptTos?.message}
          />

          <Button
            type="primary"
            value={t('common:sign-up')}
            className="submit"
            loading={loading}
          />

          <p className="create-account">
            {t('common:sign-up.already-register')}{' '}
            <Link to={'/sign-in'}>{t('common:sign-in')}</Link>
          </p>
        </form>
      </div>
    </main>
  );
};
