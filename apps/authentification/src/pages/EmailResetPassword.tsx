import { useState } from 'react';
import { Button, LabeledInput } from 'shared-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import authService from '../services/auth.service';
import { MdAlternateEmail } from 'react-icons/md';

const RequestResetSchema = z.object({
  email: z
    .string()
    .email({ message: 'error:invalid-email' })
    .min(1, { message: 'error:email-required' }),
});

type RequestResetForm = z.infer<typeof RequestResetSchema>;

export const EmailResetPassword = () => {
  const { t } = useTranslation(['error', 'common']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetForm>({
    resolver: zodResolver(RequestResetSchema),
  });

  const handleResetRequest = async (data: RequestResetForm) => {
    setLoading(true);
    try {
      await authService.emailResetPassword(data.email);
      setErrorMessage(t('error:check-email'));

      setTimeout(() => {
        navigate('/sign-in');
      }, 5000);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        switch (err.response.status) {
          case 400:
            setErrorMessage(t('error:user-not-found'));
            break;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit((data) => {
    if (isSubmitting) return;
    handleResetRequest(data);
  });

  return (
    <main className="Auth">
      <div className="image-section">
        <img />
      </div>
      <div className="form-section">
        <h1 className="company-name">peckish</h1>
        <h1 className="title">{t('common:request-reset.title')}</h1>
        <p className="description">{t('common:request-reset.description')}</p>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
        <form className="inputs-container" onSubmit={onSubmit}>
          <LabeledInput
            placeholder={t('common:email')}
            type="email"
            autoComplete="email"
            icon={<MdAlternateEmail size={16} />}
            {...register('email')}
            error={errors.email?.message}
          />

          <Button
            type="primary"
            actionType="submit"
            value={t('common:request-reset.request-reset')}
            className="submit"
            loading={loading}
          />
          <Button
            type="secondary"
            actionType="button"
            value={t('common:request-reset.go-back')}
            className="back"
            onClick={() => navigate('/sign-in')}
          />
        </form>
      </div>
    </main>
  );
};
