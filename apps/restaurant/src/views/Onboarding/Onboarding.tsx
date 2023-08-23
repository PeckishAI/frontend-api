import { useTranslation } from 'react-i18next';
import { useUserStore } from 'user-management';
import { Navigate } from 'react-router-dom';
import './Onboarding.scss';
import Integrations from '../Integrations/Integrations';

type Integration = {
  name: string;
  restaurantNumber: number;
};

const Onboarding = () => {
  const { t } = useTranslation('common');
  const { user } = useUserStore();
  const [integrated, setIntegrated] = useState<Integration[]>([]);

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
