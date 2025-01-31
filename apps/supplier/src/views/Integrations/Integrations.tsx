import { Lottie, Input, Button } from 'shared-ui';
import IntegrationCard from './Components/IntegrationCard/IntegrationCard';
import LoginModal from './Components/LoginModal/LoginModal';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.scss';
import { useNavigate } from 'react-router-dom';
import { integrationsService } from '../../services';

export type POS = {
  name: string;
  display_name: string;
  button_display: string;
  auth_type: string;
  url: string;
  logo_uri: string;
  data?: {
    client_id: string;
    oauth_url: string;
    scope: string;
  };
};

export type Integration = {
  name: string;
  restaurantNumber: number;
};

const Integrations = () => {
  const { t } = useTranslation(['common', 'onboarding']);
  // useTitle(t('pages.onboarding'));

  const navigate = useNavigate();

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
        const list = await integrationsService.getIntegrations();
        console.log(list.data);

        setPOSList(list.data);
      } catch (error) {
        console.error('Error fetching pos list:', error);
      } finally {
        setLoadingdata(false);
      }
    })();
  }, []);

  const filteredSoftwareList =
    posList.length > 0
      ? posList.filter((software) =>
          software.display_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const toggleModal = () => {
    setLoginModalVisible(!loginModalVisible);
  };

  const handleOnIntegrated = (integrated?: Integration) => {
    if (integrated) {
      setIntegrated((prevValues) => [...prevValues, integrated]);
    }
  };

  const handleValidIntegrations = () => {
    // reloadRestaurants();
    navigate('/myRestaurant');
  };

  // Loop through object and return cards

  return (
    <div className="integrations">
      <p id="welcome">{t('onboarding:onboarding.msg')}</p>
      <Input
        type="text"
        placeholder={t('onboarding:onboarding.searchPlaceholder')}
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
            {integrated.length !== 0
              ? integrated.map((system, i) => (
                  <span key={i}>
                    {system?.name} : {system?.restaurantNumber} restaurant(s)
                    {', '}
                  </span>
                ))
              : undefined}
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
              key={pos.name}
              name={pos.display_name}
              image={pos.logo_uri}
              button_display={pos.button_display}
              onClick={() => {
                setLoginModalVisible(true);
                setSelectedPOS(pos);
                // if (pos.auth_type === 'modal') {
                //   // Show login modal
                // } else {
                //   // Redirect to oauth_url
                // }
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
      {loadingData && (
        <div className="loading-container">
          <Lottie type="loading" width="200px" />
        </div>
      )}
    </div>
  );
};

export default Integrations;
