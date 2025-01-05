
import { useState } from "react";
import { MdAlternateEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { Button, LabeledInput, Checkbox } from "shared-ui";
import { useForm } from "react-hook-form";
import { authService } from "@/services/authService";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AppleButton } from "@/components/auth/AppleButton";

const SignInSchema = z.object({
  email: z.string().min(1, { message: "email-required" }).email("error:valid-email"),
  password: z.string().min(1, { message: "error:password-required" }),
});

type SignInForm = z.infer<typeof SignInSchema>;

export default function SignIn() {
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

  const handleLogin = async (data: SignInForm) => {
    setLoading(true);
    try {
      const res = await authService.logIn(data.email, data.password);
      // Store token and redirect
      localStorage.setItem('token', res.access_token);
      if (rememberMe) {
        localStorage.setItem('remember', 'true');
      }
      navigate('/');
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        switch (err.response.status) {
          case 404:
            setErrorMessage(t('error:sign-in.account-not-found'));
            break;
          case 401:
            setErrorMessage(t('error:sign-in.bad-credentials'));
            break;
          default:
            setErrorMessage(t('error:unknown-error'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen bg-gray-50">
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {t('common:sign-in.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('common:sign-in.description')}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white p-8 shadow sm:rounded-lg">
            {errorMessage && (
              <div className="mb-4 text-sm text-red-600">{errorMessage}</div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(handleLogin)}>
              <LabeledInput
                placeholder={t('common:email')} 
                type="email"
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

              <div className="flex items-center justify-between">
                <Checkbox
                  label={t('common:remember-me')}
                  checked={rememberMe}
                  onCheck={setRememberMe}
                />
                <Link to="/reset-password" className="text-sm text-primary hover:text-primary-dark">
                  {t('common:forgot-password')}
                </Link>
              </div>

              <Button
                type="primary"
                actionType="submit"
                value={t('common:sign-in')}
                loading={loading}
              />

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">{t('common:or')}</span>
                </div>
              </div>

              <GoogleButton onSuccess={handleLogin} onError={setErrorMessage} />
              <AppleButton onSuccess={handleLogin} onError={setErrorMessage} />

              <p className="mt-6 text-center text-sm text-gray-600">
                {t('common:sign-in.create-account')}{' '}
                <Link to="/sign-up" className="font-medium text-primary hover:text-primary-dark">
                  {t('common:sign-up')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
