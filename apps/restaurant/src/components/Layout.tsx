import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarItem,
  Navbar,
  SidebarSeparator,
  Select,
  IconButton,
  useNavTitle,
} from 'shared-ui';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useUserStore } from '@peckishai/user-management';
import { restaurantService, inventoryService, Ingredient } from '../services';
import { Tooltip } from 'react-tooltip';
import { NotificationCenter } from './NotificationCenter/NotificationCenter';
import AddTransferPopup from '../views/Inventory/Components/Transfers/Transfers';

type IngredientOption = {
  id: string;
  name: string;
  restaurantId: string;
};

const Layout = () => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const { logout, user } = useUserStore();
  const [isTransferPopupVisible, setTransferPopupVisible] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);

  const handleTransferPopup = async () => {
    const allIngredients: IngredientOption[] = [];
    setTransferPopupVisible(true);

    for (const restaurant of restaurants) {
      const fetchedIngredients = await inventoryService.getIngredientList(
        restaurant.uuid
      );
      const formattedIngredients = fetchedIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        restaurantId: restaurant.uuid, // Attach the restaurant ID to each ingredient
      }));

      allIngredients.push(...formattedIngredients);
    }

    setIngredients(allIngredients);
  };

  const closeTransferPopup = () => {
    setTransferPopupVisible(false);
  };

  const handleReload = () => {
    console.log('Reloading data...');
  };

  const {
    selectedRestaurantUUID,
    setSelectedRestaurantUUID,
    restaurants,
    loadRestaurants,
    restaurantsLoading,
  } = useRestaurantStore();

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleRefreshClick = () => {
    if (!selectedRestaurantUUID) return;

    setIsRefreshing(true);
    restaurantService.reloadPOS(selectedRestaurantUUID).then((success) => {
      if (success) {
        setTimeout(() => {
          setIsRefreshing(false);
          navigate(0);
        }, 2500);
      }
    });
  };

  const handleLogout = () => {
    logout();
  };

  const title = useNavTitle();

  const restaurantsOptions = restaurants.map((restaurant) => ({
    label: restaurant.name,
    value: restaurant.uuid,
  }));

  // Transforming the restaurant data to fit the AddTransferPopup
  const transformedRestaurants = restaurants.map((restaurant) => ({
    id: restaurant.uuid,
    name: restaurant.name,
  }));

  const sidebarItems = [
    {
      name: t('pages.myRestaurants'),
      icon: <i className="fa-solid fa-utensils"></i>,
      navigateTo: '/',
      disable: !user?.permissions?.my_restaurants,
    },
    {
      name: t('pages.overview'),
      icon: <i className="fa-solid fa-chart-line"></i>,
      navigateTo: '/overview',
      disable: !user?.permissions?.overview,
    },
    {
      name: t('pages.inventory.stock'),
      icon: <i className="fa-solid fa-cubes-stacked"></i>,
      navigateTo: '/inventory/stock',
      disable: !user?.permissions?.inventory,
    },
    {
      name: t('pages.recipes'),
      icon: <i className="fa-solid fa-burger"></i>,
      navigateTo: '/recipes',
      disable: !user?.permissions?.recipes,
    },
    {
      name: t('pages.documents'),
      icon: <i className="fa-solid fa-file"></i>,
      navigateTo: '/documents',
      disable: !user?.permissions?.documents,
    },
    {
      separatorName: t('services'),
    },
    {
      name: t('pages.integrations'),
      icon: <i className="fa-solid fa-puzzle-piece"></i>,
      navigateTo: '/integrations',
      disable: !user?.permissions?.integrations,
    },
  ];

  return (
    <>
      <Sidebar>
        {sidebarItems.map((item) =>
          item.separatorName !== undefined ? (
            <SidebarSeparator
              key={item.separatorName}
              sectionName={item.separatorName}
            />
          ) : (
            <SidebarItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              to={item.navigateTo}
              disable={item.disable}
            />
          )
        )}
        <div className="restaurant-dropdown">
          <p className="label">{t('navbar.restaurantsDropdown')} :</p>
          <Select
            menuPlacement="top"
            isLoading={restaurantsLoading}
            options={restaurantsOptions}
            value={restaurantsOptions.find(
              (opt) => opt.value === selectedRestaurantUUID
            )}
            onChange={(option) => {
              if (option === null) return;
              setSelectedRestaurantUUID(option.value);
            }}
          />
        </div>
      </Sidebar>
      <div className="main">
        <Navbar
          title={title}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshClick}
          onLogout={handleLogout}
          options={
            <>
              <IconButton
                icon={<i className="fa-solid fa-boxes-packing"></i>}
                tooltipMsg={t('transfer')}
                tooltipId="nav-tooltip"
                onClick={handleTransferPopup}
              />
              <AddTransferPopup
                isVisible={isTransferPopupVisible}
                onRequestClose={closeTransferPopup}
                onReload={handleReload}
                restaurants={transformedRestaurants} // Using the actual restaurant data
                ingredients={ingredients} // You will replace this with actual ingredients data later
              />
              <NotificationCenter />
              <IconButton
                icon={<i className="fa-solid fa-rotate"></i>}
                onClick={handleRefreshClick}
                tooltipMsg={t('refresh')}
                tooltipId="nav-tooltip"
                loading={isRefreshing}
              />
              <IconButton
                icon={<i className="fa-solid fa-arrow-right-from-bracket"></i>}
                onClick={handleLogout}
                tooltipMsg={t('logout')}
                tooltipId="nav-tooltip"
              />
              <Tooltip className="tooltip" id="nav-tooltip" />
            </>
          }
        />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
