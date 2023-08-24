import { IntegrationCard, LoginModal, Lottie, Input, Button } from 'shared-ui';
import { useEffect, useState } from 'react';
import { onboardingService } from '../../services';
import { useTranslation } from 'react-i18next';
import './style.scss';
import { log } from 'console';

export type POS = {
  name: string;
  display_name: string;
  button_display: string;
  auth_type: string;
  oauth_url: string;
  logo_uri: string;
};

type Integration = {
  name: string;
  restaurantNumber: number;
};

const Integrations = (props: Props) => {
  const { t } = useTranslation('common');
  const [loadingData, setLoadingdata] = useState(false);
  const [posList, setPOSList] = useState<POS[]>([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [selectedPOS, setSelectedPOS] = useState<POS | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [integrated, setIntegrated] = useState<Integration[]>([]);

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

  const filteredSoftwareList = posList.filter((software) =>
    software.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleModal = () => {
    setLoginModalVisible(!loginModalVisible);
  };

  const handleOnIntegrated = () => {
    setIntegrated((prevValues) => [
      ...prevValues,
      {
        name: 'burger king',
        restaurantNumber: 8,
      },
    ]);
  };

  const handleValidIntegrations = () => {
    setLoadingdata(true);
  };

  // Loop through object and return cards
  return (
    <div className="integrations">
      <p>{t('onboarding.msg')}</p>
      <Input
        type="text"
        placeholder={t('onboarding.search')}
        value={searchTerm}
        onChange={(value) => setSearchTerm(value)}
        className="onboarding-search"
      />
      {integrated.length !== 0 ? (
        <>
          <p className="integrated-systems">
            <span style={{ color: 'var(--primaryColor)' }}>
              Congratulation ! You have integrated :{' '}
            </span>
            {integrated?.map((system, i) => (
              <span key={i}>
                {system.name} : {system.restaurantNumber} restaurant(s){', '}
              </span>
            ))}
          </p>
          <Button
            type="primary"
            value={t('finish')}
            onClick={handleValidIntegrations}
            className="button-fixed-bottom"
          />
        </>
      ) : undefined}
      <div className="cards-container">
        {filteredSoftwareList.map((pos) => {
          return (
            <IntegrationCard
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
      <LoginModal
        pos={selectedPOS}
        isVisible={loginModalVisible}
        toggleModal={toggleModal}
        onIntegrated={handleOnIntegrated}
      />
      {loadingData && !integrated && (
        <div className="loading-container">
          <Lottie type="loading" width="200px" />
        </div>
      )}
      {loadingData && integrated && (
        <div className="loading-container retrieve-data-loading">
          <Lottie type="loading" width="200px" />
          <span id="bold">{t('onboarding.recoverData')}</span>
          <span>{t('onboarding.wait')}</span>
        </div>
      )}
    </div>
  );
};

export default Integrations;
