import { OnboardingCard, LoginModal, Lottie, Input } from 'shared-ui';
import { useEffect, useState } from 'react';
import { onboardingService } from '../../services';
import { useTranslation } from 'react-i18next';
import { useUserStore } from 'user-management';
import { Navigate } from 'react-router-dom';
import './Onboarding.scss';

export type POS = {
  name: string;
  display_name: string;
  button_display: string;
  auth_type: string;
  oauth_url: string;
  logo_uri: string;
};

const Onboarding = () => {
  const { t } = useTranslation('common');
  const [loadingData, setLoadingdata] = useState(false);
  const [posList, setPOSList] = useState<POS[]>([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [selectedPOS, setSelectedPOS] = useState<POS | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUserStore();

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

  // Loop through object and return cards
  return (
    <div className="onboarding">
      <h1 className="title">Onboarding</h1>
      <p>Select the software that you want to integrate to Peckish !</p>
      <Input
        type="text"
        placeholder="Search software"
        value={searchTerm}
        onChange={(value) => setSearchTerm(value)}
        className="onboarding-search"
      />
      {/* modal */}
      <LoginModal pos={selectedPOS} isVisible={loginModalVisible} />
      <div className="cards-container">
        {filteredSoftwareList.map((pos) => {
          return (
            <OnboardingCard
              key={pos.display_name}
              name={pos.display_name}
              image={pos.logo_uri}
              button_display={pos.button_display}
              onClick={() => {
                if (pos.auth_type === 'modal') {
                  // Show login modal
                  setLoginModalVisible(true);
                  setSelectedPOS(pos);
                } else {
                  // Redirect to oauth_url
                }
              }}
            />
          );
        })}
      </div>
      {loadingData && (
        <div className="loading-middle-page-overlay">
          <div className="loading-container">
            <Lottie type="loading" width="200px" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
