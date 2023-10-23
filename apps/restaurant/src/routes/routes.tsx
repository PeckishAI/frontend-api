import { createBrowserRouter, Navigate } from 'react-router-dom';
import MyRestaurant from '../views/MyRestaurant';
import Overview from '../views/Overview/Overview';
import Inventory from '../views/Inventory/Inventory';
import Recipes from '../views/Recipes';
import Onboarding from '../views/Onboarding/Onboarding';
import Layout from '../components/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import Integrations from '../views/Integrations/Integrations';
import { OrderValidation } from '../views/OrderValidation/OrderValidation';
import OAuthPopup from '../utils/oauth/OAuth2Popup';
import { OnboardRestaurant } from '../views/Onboarding/OnboardRestaurant';

export const router = createBrowserRouter([
  {
    path: '/oauth/callback',
    element: <OAuthPopup />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      // {
      //   index: true,
      //   element: <Navigate to={'/overview'} />,
      // },
      {
        path: '/onboarding',
        element: <Onboarding />,
      },
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            index: true,
            element: <MyRestaurant />,
          },
          {
            path: '/overview',
            element: <Overview />,
          },
          {
            path: '/inventory/:tab',
            element: <Inventory />,
          },
          {
            path: '/recipes',
            element: <Recipes />,
          },
          {
            path: '/integrations',
            element: <Integrations />,
          },
          {
            path: '/orders/validation',
            element: <OrderValidation />,
          },

          {
            path: '/onboarding/:step',
            element: <OnboardRestaurant />,
          },

          {
            path: '*',
            element: <Navigate to={'/'} />,
          },
        ],
      },
    ],
  },
]);
