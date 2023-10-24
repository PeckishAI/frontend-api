import { useState } from 'react';
import { MdAlternateEmail } from 'react-icons/md';
import { FaLock, FaUser } from 'react-icons/fa';
import { Button, LabeledInput, Checkbox } from 'shared-ui';
import { useForm } from 'react-hook-form';
import authService, { LogInResult } from '../services/auth.service';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Trans, useTranslation } from 'react-i18next';
import { GoogleButton } from '../components/GoogleButton';
import { AppleButton } from '../components/AppleButton';

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
          <GoogleButton
            type="sign-up"
            handleRequest={handleRegister}
            setErrorMessage={setErrorMessage}
          />

          <AppleButton
            type="sign-up"
            handleRequest={handleRegister}
            setErrorMessage={setErrorMessage}
          />

          <div className="or">
            <span>{t('common:or')}</span>
          </div>

          <LabeledInput
            placeholder={t('common:name')}
            type="text"
            autoComplete="name"
            icon={<FaUser size={16} />}
            {...register('name')}
            error={errors.name?.message}
          />

          <LabeledInput
            placeholder={t('common:email')}
            type="text"
            autoComplete="email"
            icon={<MdAlternateEmail color="var(--primaryColor)" size={16} />}
            {...register('email')}
            error={errors.email?.message}
          />
          <div className="password-row">
            <LabeledInput
              placeholder={t('common:password')}
              type="password"
              autoComplete="new-password"
              icon={<FaLock size={16} />}
              {...register('password')}
              error={errors.password?.message}
            />
            <LabeledInput
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
            label={
              <Trans
                i18nKey="sign-up.tos-checkbox"
                components={{
                  tosLink: (
                    <a
                      href="https://iampeckish.com/terms-conditions"
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                  privacyLink: (
                    <a
                      href="https://iampeckish.com/privacy-policy"
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                }}
              />
            }
            {...register('acceptTos')}
            error={errors.acceptTos?.message}
          />

          <Button
            type="primary"
            actionType="submit"
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
