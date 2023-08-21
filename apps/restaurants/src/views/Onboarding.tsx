import { Card, LoginModal, Lottie } from 'shared-ui';
import { useEffect, useState } from 'react';
import { onboardingService } from '../services';
import { useTranslation } from 'react-i18next';

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

  // Fetch data from API Backend (Get POS)
  useEffect(() => {
    (async () => {
      try {
        setLoadingdata(true);
        const list = await onboardingService.getPOSList();
        setLoadingdata(false);
        console.log(list.data);

        setPOSList(list.data);
      } catch (error) {
        console.error('Error fetching pos list:', error);
      }
    })();
  }, []);

  // Loop through object and return cards
  return (
    <>
      {/* modal */}
      <LoginModal pos={selectedPOS} isVisible={loginModalVisible} />

      {posList.map((pos) => {
        return (
          <Card
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
      {loadingData && (
        <div className="loading-middle-page-overlay">
          <div className="loading-container">
            <Lottie type="loading" width="200px" />
          </div>
        </div>
      )}
    </>
  );
};

export default Onboarding;
