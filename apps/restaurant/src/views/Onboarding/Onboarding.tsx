import { useTranslation } from 'react-i18next';
import { useUserStore } from 'user-management';
import { Navigate } from 'react-router-dom';
import './Onboarding.scss';
import Integrations from '../Integrations/Integrations';

const Onboarding = (props: Props) => {
  const { t } = useTranslation('common');
  const { user } = useUserStore();
  const [integrated, setIntegrated] = useState<Integration[]>([]);

  // Fetch data from API Backend (Get POS)
  useEffect(() => {
    (async () => {
      try {
        setLoadingdata(true);
        const list = await onboardingService.getPOSList();
        setLoadingdata(false);

        setPOSList(list.data);
      } catch (error) {
        console.error('Error fetching pos list:', error);
      }
    })();
  }, []);

  const filteredSoftwareList = posList.filter((software) =>
    software.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
