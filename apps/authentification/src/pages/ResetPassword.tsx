import { useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { Button, LabeledInput } from 'shared-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import authService from '../services/auth.service';

const ResetPasswordSchema = z
  .object({
    password: z.string().min(1, { message: 'error:password-required' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'error:confirm-password-required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'error:passwords-must-match',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

export const ResetPassword = () => {
  const { t } = useTranslation(['error', 'common']);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const handlePasswordReset = async (data: ResetPasswordForm) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      navigate('/sign-in');
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        console.log('error', err.response);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit((data) => {
    if (isSubmitting) return;
    handlePasswordReset(data);
  });

  return (
    <main className="Auth">
      <div className="image-section">
        <img />
      </div>
      <div className="form-section">
        <h1 className="company-name">peckish</h1>

        <h1 className="title">{t('common:reset-password.title')}</h1>
        <p className="description">{t('common:reset-password.description')}</p>

        <form className="inputs-container" onSubmit={onSubmit}>
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
            autoComplete="new-password"
            icon={<FaLock size={16} />}
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <Button
            type="primary"
            actionType="submit"
            value={t('common:reset-password')}
            className="submit"
            loading={loading}
          />
        </form>
      </div>
    </main>
  );
};
