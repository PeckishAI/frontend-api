import { Lottie, Input, Button, useTitle } from 'shared-ui';
import IntegrationCard from './Components/IntegrationCard/IntegrationCard';
import LoginModal from './Components/LoginModal/LoginModal';
import { useEffect, useState } from 'react';
import { onboardingService } from '../../services';
import { useTranslation } from 'react-i18next';
import './style.scss';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { TFunction } from 'i18next';

export type POS = {
  name: string;
  display_name: string;
  button_display: string;
  auth_type: string;
  type: 'POS' | 'DELIVERY' | 'OTHER';
  url: string;
  logo_uri: string;
  data?: {
    client_id: string;
    oauth_url: string;
    scope: string;
  };
};

type IntegrationCat = {
  label: string;
  value: 'POS' | 'DELIVERY' | 'OTHER';
  icon: React.ReactElement;
  integrations: POS[];
};

export type Integration = {
  name: string;
  restaurantNumber: number;
};

const Integrations = () => {
  const { t } = useTranslation(['common', 'onboarding']);
  useTitle(t('pages.onboarding'));

  const navigate = useNavigate();

  const [loadingData, setLoadingdata] = useState(false);
  const [posList, setPOSList] = useState<POS[]>([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [selectedPOS, setSelectedPOS] = useState<POS | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [integrated, setIntegrated] = useState<Integration[]>([]);
  const [integratedProviders, setIntegratedProviders] = useState<string[]>([]);

  const { loadRestaurants, restaurants, restaurantUUID } = useRestaurantStore(
    (state) => ({
      loadRestaurants: state.loadRestaurants,
      restaurants: state.restaurants,
      restaurantUUID: state.selectedRestaurantUUID,
    })
  );

  useEffect(() => {
    if (!restaurantUUID) return;

    const selectedRestaurant = restaurants.find(
      (restaurant) => restaurant.restaurant_uuid === restaurantUUID
    );

    if (selectedRestaurant) {
      const providerNames = selectedRestaurant?.provider
        .map((provider) =>
          Object.keys(provider).filter((key) => provider[key] === true)
        )
        .reduce((acc, curr) => acc.concat(curr), []);
      setIntegratedProviders(providerNames);
    }
  }, [restaurantUUID, restaurants]);

  // Fetch data from API Backend (Get POS)
  useEffect(() => {
    (async () => {
      try {
        setLoadingdata(true);
        const list = await onboardingService.getPOSList();
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
  const pos = filteredSoftwareList.filter((soft) => soft.type === 'POS');
  const deliveries = filteredSoftwareList.filter(
    (soft) => soft.type === 'DELIVERY'
  );
  const others = filteredSoftwareList.filter((soft) => soft.type === 'OTHER');
  const integrationsByCat: IntegrationCat[] = [
    {
      label: t('integrationCategories.pos'),
      value: 'POS',
      icon: <i className="fa-solid fa-comments-dollar"></i>,
      integrations: pos,
    },
    {
      label: t('integrationCategories.delivery'),
      value: 'DELIVERY',
      icon: <i className="fa-solid fa-truck"></i>,
      integrations: deliveries,
    },
    {
      label: t('integrationCategories.others'),
      value: 'OTHER',
      icon: <i className="fa-solid fa-puzzle-piece"></i>,
      integrations: others,
    },
  ];

  const toggleModal = () => {
    setLoginModalVisible(!loginModalVisible);
  };

  const handleOnIntegrated = (integrated?: Integration) => {
    if (integrated) {
      setIntegrated((prevValues) => [...prevValues, integrated]);
    }
  };

  const handleValidIntegrations = () => {
    loadRestaurants();
    navigate('/myRestaurant');
  };

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
      {integrationsByCat.map(
        (category) =>
          category.integrations.length > 0 && (
            <div key={category.value}>
              <div className="category">
                {category.icon}
                <p className="name">{category.label}</p>
              </div>
              <div className="cards-container">
                {category.integrations.map((pos) => (
                  <IntegrationCard
                    key={pos.name}
                    name={pos.display_name}
                    image={pos.logo_uri}
                    button_display={
                      integratedProviders.includes(pos.name.toLowerCase())
                        ? 'Connected'
                        : pos.button_display
                    }
                    disabled={integratedProviders.includes(
                      pos.name.toLowerCase()
                    )}
                    onClick={() => {
                      if (
                        !integratedProviders.includes(pos.name.toLowerCase())
                      ) {
                        setLoginModalVisible(true);
                        setSelectedPOS(pos);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )
      )}
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
