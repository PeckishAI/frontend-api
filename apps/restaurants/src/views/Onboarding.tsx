import { Card, LoginModal, Lottie } from 'shared-ui';
import { useEffect, useState } from 'react';
import { onboardingService } from '../_services';
import { useTranslation } from 'react-i18next';

type Props = {};

type POS = {
  pos_uuid: string;
  name: string;
  display_name: string;
  button_display: string;
  auth_type: string;
  oauth_url: string;
  image_url: string;
};

const Onboarding = (props: Props) => {
  const { t } = useTranslation('common');
  const [loadingData, setLoadingdata] = useState(false);
  const [posList, setPOSList] = useState<POS[]>([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [buttonModalRedirect, setButtonModalRedirect] = useState<
    string | null
  >();

  // Fetch data from API Backend (Get POS)
  function reloadPOSData() {
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
  }
  useEffect(() => {
    reloadPOSData();
  }, []);

  // cards

  // Loop through object and return cards
  return (
    <>
      {/* modal */}

      <LoginModal isVisible={loginModalVisible} />

      {posList.map((pos) => {
        return (
          <Card
            key={pos.pos_uuid}
            name={pos.display_name}
            description={pos.button_display}
            image={pos.image_url}
            onClick={() => {
              if (pos.auth_type === 'modal') {
                // Show login modal
                setLoginModalVisible(true);
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
