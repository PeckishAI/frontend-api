import { useTranslation } from 'react-i18next';
import { useUserStore } from '@peckishai/user-management';
import { Navigate } from 'react-router-dom';
import './Onboarding.scss';
import Integrations from '../Integrations/Integrations';

const Onboarding = () => {
  const { t } = useTranslation('common');
  const { user } = useUserStore();

  if (user && user.onboarded) {
    return <Navigate to="/" />;
  }

  return (
    <div className="onboarding">
      <h1 className="title">{t('onboarding')}</h1>
      <Integrations />
    </div>
  );
};

export default Onboarding;
